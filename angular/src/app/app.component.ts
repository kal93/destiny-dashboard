import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { MdDialog } from '@angular/material';
import { ConfirmDialog } from './shared/dialogs/confirm.component';
import { HttpService } from './shared/services/http.service';
import { ManifestService } from './bungie/manifest/manifest.service';
import { SharedApp } from './shared/services/shared-app.service';
import { SharedBungie } from './bungie/shared-bungie.service';
import { SharedDashboard } from './dashboard/shared-dashboard.service';

import {
  AccountStatsService, AccountSummaryService, BungieSiteNewsService, CharacterInventorySummaryService, CharacterStatsService, CharacterProgressionService,
  ClanLeaderboardsStatsService, GetBungieAccountService, InventoryItemService, VaultSummaryService
} from './bungie/services/service.barrel';

import { ICard, IUserDashboard } from './cards/_base/card.interface';

import { Angulartics2GoogleAnalytics } from 'angulartics2';

import { CardDefinitions } from './cards/_base/card-definition';
import { fadeInOut } from './shared/animations';

@Component({
  selector: 'dd-app',
  template: `<dd-nav></dd-nav>
  <div *ngIf="sharedApp.showLoadingIds.size > 0" class="loading-dim" [@fadeInOut]="true">
    <div class="loader">
      <svg class="circular" viewBox="25 25 50 50">
        <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10" />
      </svg>
    </div>
  </div>
  `,
  providers: [AccountStatsService, AccountSummaryService, BungieSiteNewsService, ClanLeaderboardsStatsService, CharacterInventorySummaryService, CharacterProgressionService, CharacterStatsService,
    GetBungieAccountService, InventoryItemService, HttpService, ManifestService, SharedBungie, SharedDashboard, VaultSummaryService],
  animations: [fadeInOut()]
})
export class AppComponent {
  constructor(private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics, private changeDetectorRef: ChangeDetectorRef, private http: HttpService, private manifestService: ManifestService,
    public mdDialog: MdDialog, private sharedBungie: SharedBungie, private sharedDashboard: SharedDashboard, public sharedApp: SharedApp) { }

  resizeTimeoutId: NodeJS.Timer;

  ngOnInit() {
    this.manifestService.loadManifest().then(() => {
      this.initApp();
    });
  }

  initApp() {
    if (this.sharedApp.accessToken == null) {
      // Use regular local storage for bungieAuthCode since we use it in index.html before we've loaded sharedApp
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

    if (!this.sharedApp.localStorageDisabled && this.sharedApp.getSessionStorage("LimitedFeaturesDialog") == null) {
      let dialogRef = this.mdDialog.open(ConfirmDialog, { height: '230px', width: '290px', });
      dialogRef.componentInstance.title = "Limited Features";
      dialogRef.componentInstance.message = "Welcome! Since you are not logged in, you will have limited access to certain features.";
      dialogRef.componentInstance.optionLeft = "Tutorial";
      dialogRef.componentInstance.optionRight = "Ok";

      dialogRef.afterClosed().subscribe((result: string) => {
        if (result == "Tutorial") this.sharedApp.startTutorial();
      });
      this.sharedApp.setSessionStorage("LimitedFeaturesDialog", "");
    }
    this.setAppInitialized();
  }

  loadUser() {
    //Load sharedBungie, then SharedDashboard
    this.sharedBungie.getMembershipsForCurrentUser().then(() => {
      //Once we have account info, get the user layout and their preferences
      this.sharedDashboard.loadUser().then(() => {
        if (this.sharedApp.userPreferences.membershipIndex > this.sharedBungie.destinyMemberships.length - 1)
          this.sharedApp.userPreferences.membershipIndex = 0;
        this.setAppInitialized();
      }).catch((error) => {
        this.setAppInitialized();
      });
    }).catch((error) => {
      this.sharedApp.showError("Could not load membership for the current user. This is probably an error with Bungie's servers, please try again later.");
      this.setAppInitialized();
    });
  }

  setAppInitialized() {
    // Let the rest of the app know that the manifest has been loaded and the app is ready to go
    this.sharedApp.appInitialized = true;

    // Run CD since we are changing a variable that has been initialized during this function
    this.changeDetectorRef.detectChanges();
  }

  //Global dom events
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    console.log("resize");
    this.sharedApp.onResize();

    // Hack for Safari since it doesn't actually resize immediately
    clearTimeout(this.resizeTimeoutId);
    this.resizeTimeoutId = setTimeout(() => {
      this.sharedApp.onResize();
    }, 200);
  }
}