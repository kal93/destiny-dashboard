import { ChangeDetectorRef, Component } from '@angular/core';
import { MdDialog } from '@angular/material';
import { AlertDialog } from 'app/shared/dialogs/alert.component';
import { HttpService } from 'app/shared/services/http.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { SharedBungie } from './bungie/shared-bungie.service';
import { SharedDashboard } from './dashboard/shared-dashboard.service';

import {
  BungieSiteNewsService, DestinyAccountService, DestinyMilestonesService, DestinyStatsService, DestinyProfileService,
  DestinyUserService, DestinyGroupService, InventoryItemService
} from './bungie/services/service.barrel';


import { fadeInOut } from './shared/animations';
import { Angulartics2GoogleAnalytics } from 'angulartics2';

@Component({
  selector: 'dd-app',
  template: `<dd-nav></dd-nav>
  <div *ngIf="sharedApp.nightMode == true" class="night-mode" (click)="nightModeClicked()"></div>  
  <div *ngIf="sharedApp.showLoadingIds.size > 0" class="loading-dim" [@fadeInOut]="true">
    <div class="loader">
      <svg class="circular" viewBox="25 25 50 50">
        <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10" />
      </svg>
    </div>
  </div>
  `,
  providers: [BungieSiteNewsService, DestinyAccountService, DestinyMilestonesService, DestinyStatsService, DestinyProfileService,
    DestinyUserService, DestinyGroupService, InventoryItemService, SharedBungie, SharedDashboard],
  animations: [fadeInOut()]
})
export class AppComponent {
  constructor(private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics, private changeDetectorRef: ChangeDetectorRef, private http: HttpService, private manifestService: ManifestService,
    public mdDialog: MdDialog, private sharedBungie: SharedBungie, private sharedDashboard: SharedDashboard, public sharedApp: SharedApp) { }

  ngOnInit() {
    this.cordovaInit();
    this.initApp();
  }

  cordovaInit() {
    document.addEventListener("deviceready", () => {
      console.log("Cordova init");
    });
  }

  initApp() {
    if (this.sharedApp.accessToken == null) {
      if (this.sharedApp.localStorageDisabled) {
        this.welcomeUser();
        return;
      }
      // Use regular local storage for bungieAuthCode since we use it in index.html before we've loaded sharedApp
      let bungieAuthCode = localStorage.getItem("bungieAuthCode");
      bungieAuthCode == null ? this.welcomeUser() : this.getBungieAccessToken(bungieAuthCode);
    }
    else {
      this.loadUser();
    }
  }

  getBungieAccessToken(bungieAuthCode: string) {
    this.http.getBungieAccessToken(bungieAuthCode).then(() => {
      localStorage.removeItem("bungieAuthCode");
      this.loadUser();
    }).catch((error) => {
      this.sharedApp.showError("There was an error when getting the Access Token from Bungie. Please try again.", error);
      this.sharedApp.logOutSubject.next();
      this.initManifest();
    });
  }

  welcomeUser() {
    this.sharedDashboard.clearUserDashboards();
    this.initManifest();
  }

  loadUser() {
    //Load sharedBungie, then SharedDashboard
    this.sharedBungie.getMembershipsForCurrentUser().then(() => {
      if (this.sharedBungie.destinyMemberships.length == 0) {
        this.sharedApp.showError("Could not find any Destiny 2 memberships associated with this account!");
        this.initManifest();
        this.sharedApp.logOutSubject.next();
        return;
      }

      //Once we have account info, get the user layout and their preferences
      this.sharedDashboard.loadUser().then(() => {
        if (this.sharedApp.userPreferences.membershipIndex > this.sharedBungie.destinyMemberships.length - 1)
          this.sharedApp.userPreferences.membershipIndex = 0;
        this.initManifest();
      }).catch((error) => {
        this.initManifest();
      });
    }).catch((error) => {
      if (error.Message != null)
        this.sharedApp.showError("Could not load the Bungie User. Error from Bungie: " + error.Message);
      else
        this.sharedApp.showError("Could not load the Bungie User. This is probably an error with Bungie's servers, please try again later.");
      this.sharedApp.logOutSubject.next();
      this.initManifest();
    });
  }

  initManifest() {
    this.manifestService.loadManifest().then(() => {
      // Let the rest of the app know that the manifest has been loaded and the app is ready to go
      this.sharedApp.appInitialized = true;

      // Run CD since we are changing a variable that has been initialized during this function
      this.changeDetectorRef.detectChanges();
    }).catch((error) => {
      this.sharedApp.showError("There was an error loading the database from Bungie, please try again later.", error);
    });
  }

  nightModeClicked() {
    let dialogRef = this.mdDialog.open(AlertDialog, { height: '295px', width: '320px', });
    dialogRef.componentInstance.title = "Night Mode";
    dialogRef.componentInstance.message = "Whoa, you're not supposed to see this message! If you do, it means Night Mode is not supported by your browser and would break things if we kept it on. We need to disable Night Mode for you.";
    this.sharedApp.nightMode = false;
    this.sharedApp.removeLocalStorage("nightMode");
  }
}