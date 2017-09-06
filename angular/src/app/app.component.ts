import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { MdDialog } from '@angular/material';
import { AlertDialog } from 'app/shared/dialogs/alert.component';
import { ConfirmDialog } from 'app/shared/dialogs/confirm.component';
import { HttpService } from 'app/shared/services/http.service';
import { ManifestService } from './bungie/manifest/manifest.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { SharedBungie } from './bungie/shared-bungie.service';
import { SharedDashboard } from './dashboard/shared-dashboard.service';

import { CardDefinitions } from './cards/_base/card-definition';
import { ICard, IUserDashboard } from './cards/_base/card.interface';
import {
  AccountStatsService, AccountSummaryService, BasicProfileService, BungieSiteNewsService, CharacterInventorySummaryService, CharacterStatsService, CharacterProgressionService,
  ClanLeaderboardsStatsService, GetBungieAccountService, InventoryItemService, VaultSummaryService
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
  providers: [AccountStatsService, AccountSummaryService, BasicProfileService, BungieSiteNewsService, ClanLeaderboardsStatsService, CharacterInventorySummaryService, CharacterProgressionService, CharacterStatsService,
    GetBungieAccountService, InventoryItemService, SharedBungie, SharedDashboard, VaultSummaryService],
  animations: [fadeInOut()]
})
export class AppComponent {
  constructor(private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics, private changeDetectorRef: ChangeDetectorRef, private http: HttpService, private manifestService: ManifestService,
    public mdDialog: MdDialog, private sharedBungie: SharedBungie, private sharedDashboard: SharedDashboard, public sharedApp: SharedApp) { }

  ngOnInit() {
    this.sharedApp.destiny2Warning();
    this.manifestService.loadManifest().then(() => {
      this.initApp();
    });
  }

  initApp() {
    if (this.sharedApp.accessToken == null) {
      // Use regular local storage for bungieAuthCode since we use it in index.html before we've loaded sharedApp
      if (this.sharedApp.localStorageDisabled) {
        this.welcomeUser();
        return;
      }
      let bungieAuthCode = localStorage.getItem("bungieAuthCode");
      if (bungieAuthCode == null)
        this.welcomeUser();
      else {
        this.http.getBungieAccessToken(bungieAuthCode).then(() => {
          localStorage.removeItem("bungieAuthCode");
          this.loadUser();
        }).catch((error) => {
          this.sharedApp.showError("There was an error when getting the Access Token from Bungie. Please try again.", error);
          this.sharedApp.logOutSubject.next();
          this.sharedDashboard.userDashboards = CardDefinitions.defaultDashboards;
          this.setAppInitialized();
        });
      }
    }
    else {
      this.loadUser();
    }
  }

  welcomeUser() {
    this.sharedDashboard.userDashboards = CardDefinitions.defaultDashboards;

    if (!this.sharedApp.localStorageDisabled && this.sharedApp.getLocalStorage("LimitedFeaturesDialog") == null) {
      let dialogRef = this.mdDialog.open(ConfirmDialog, { height: '230px', width: '290px', });
      dialogRef.componentInstance.title = "Limited Features";
      dialogRef.componentInstance.message = "Welcome! Since you are not logged in, you will have limited access to certain features.";
      dialogRef.componentInstance.optionLeft = "Tutorial";
      dialogRef.componentInstance.optionRight = "Ok";

      dialogRef.afterClosed().subscribe((result: string) => {
        if (result == "Tutorial") this.sharedApp.startTutorial();
      });
      this.sharedApp.setLocalStorage("LimitedFeaturesDialog", "1");
    }
    this.setAppInitialized();
  }

  loadUser() {
    //Load sharedBungie, then SharedDashboard
    this.sharedBungie.getMembershipsForCurrentUser().then(() => {
      if (this.sharedBungie.destinyMemberships.length == 0) {
        this.sharedApp.showError("Could not find any Destiny 2 memberships associated with this account!");
        this.setAppInitialized();
        this.sharedApp.logOutSubject.next();
        return;
      }

      //Once we have account info, get the user layout and their preferences
      this.sharedDashboard.loadUser().then(() => {
        if (this.sharedApp.userPreferences.membershipIndex > this.sharedBungie.destinyMemberships.length - 1)
          this.sharedApp.userPreferences.membershipIndex = 0;
        this.setAppInitialized();
      }).catch((error) => {
        this.setAppInitialized();
      });
    }).catch((error) => {
      if (error.Message != null)
        this.sharedApp.showError("Could not load the Bungie User. Error from Bungie: " + error.Message);
      else
        this.sharedApp.showError("Could not load the Bungie User. This is probably an error with Bungie's servers, please try again later.");
      this.sharedApp.logOutSubject.next();
      this.setAppInitialized();
    });
  }

  setAppInitialized() {
    // Let the rest of the app know that the manifest has been loaded and the app is ready to go
    this.sharedApp.appInitialized = true;

    // Run CD since we are changing a variable that has been initialized during this function
    this.changeDetectorRef.detectChanges();
  }

  nightModeClicked() {
    let dialogRef = this.mdDialog.open(AlertDialog, { height: '295px', width: '320px', });
    dialogRef.componentInstance.title = "Night Mode";
    dialogRef.componentInstance.message = "Whoa, you're not supposed to see this message! If you do, it means Night Mode is not supported by your browser and would break things if we kept it on. We need to disable Night Mode for you.";
    this.sharedApp.nightMode = false;
    this.sharedApp.removeLocalStorage("nightMode");
  }
}