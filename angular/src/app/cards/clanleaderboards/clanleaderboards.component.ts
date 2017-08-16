import { Component, ViewChild } from '@angular/core';
import { MdTabGroup } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { SharedBungie } from 'app/bungie/shared-bungie.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { GetBungieAccountService, ClanLeaderboardsStatsService } from 'app/bungie/services/service.barrel';

import { ModeTypes } from 'app/bungie/services/enums.interface';
import { DestinyMembership, IClanLeaderboardsStats, IGetBungieAccount, BungieAccountClan, BungieGroupInfo } from 'app/bungie/services/interface.barrel';

import { fadeIn } from 'app/shared/animations';

@Component({
  selector: 'dd-clanleaderboards',
  templateUrl: './clanleaderboards.component.html',
  styleUrls: ['../_base/card.component.scss', './clanleaderboards.component.scss'],
  animations: [fadeIn()]
})
export class ClanLeaderboardsComponent extends CardComponent {
  CARD_DEFINITION_ID = 7;

  @ViewChild("tabGroup")
  tabGroup: MdTabGroup;

  selectedTabIndex: number = 0;

  // Current membership
  selectedMembership: DestinyMembership;

  // Bungie user account
  bungieAccount: IGetBungieAccount;
  bungieAccountRelatedGroups: BungieGroupInfo;

  // Initialize this in case first membership provided has no clan
  bungieClanName = "No Clan Found!";

  // Clan leaderboard stats
  clanLeaderboardsStats: IClanLeaderboardsStats;
  
  constructor(private getBungieAccountService: GetBungieAccountService, private clanLeaderboardsStatsService: ClanLeaderboardsStatsService, public domSanitizer: DomSanitizer,
    private sharedBungie: SharedBungie, public sharedApp: SharedApp) {
    super(sharedApp);
  }

  ngOnInit() {
    super.ngOnInit();

  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  membershipSelected(selectedMembership: DestinyMembership) {
    this.selectedMembership = selectedMembership;
    // let myMembershipString = JSON.stringify(this.selectedMembership);
    // console.log("Membership info: " + myMembershipString);

    // Get Bungie account info to retrieve clan groupId
    this.getBungieAccountService.getGetBungieAccount(this.selectedMembership).then((bungieAccount: IGetBungieAccount) => { 
      this.bungieAccount = bungieAccount;
      // let myBungieAccountString = JSON.stringify(this.bungieAccount);
      // console.log("Bungie account: " + myBungieAccountString);

      if ( this.bungieAccount.clans[0] !== undefined ) {
        console.log("Clan object found");
        // let myClanString = JSON.stringify(this.bungieAccount.clans[0], null, 4);
        // console.log("Clan info: " + myClanString);

        if ( this.bungieAccount.clans[0].groupId !== undefined ) {
          console.log("Clan groupId: " + this.bungieAccount.clans[0].groupId);

          // Call stats function to get leaderboard stats for view
          this.getLbStats(this.bungieAccount);

          //Set shorter variable name to use in with odd relatedGroups data to get clan name
          let bungieClanGroupId = this.bungieAccount.clans[0].groupId;
  
          if ( this.bungieAccount.relatedGroups[bungieClanGroupId] !== undefined ) {
            this.bungieAccountRelatedGroups = bungieAccount.relatedGroups[bungieClanGroupId];
            console.log("relatedGroups found");
            // let myRgString = JSON.stringify(this.bungieAccountRelatedGroups);
            // console.log("relatedGroups: " + myRgString);
            
            if ( this.bungieAccountRelatedGroups.name !== undefined ) {
            // Overwrite default with actual clan name
            this.bungieClanName = this.bungieAccountRelatedGroups.name;
            console.log("Clan name: " + this.bungieClanName);

            } else {
              console.log("Clan name not found!");
            }

          } else {
            console.log("Clan specific related groups not found!");
          }

        } else {
          console.log("Clan groupId not found!");
        }

      } else {
        this.bungieClanName = "No Clan found!";
        this.clanLeaderboardsStats = undefined;
        console.log("Clans array not found!");
      }
      
    });
  }


   getLbStats(bungieAccount: IGetBungieAccount) {

    // For completion logging modes value
     console.log("modes= " + ModeTypes.RAID);

    // Get clan leaderboard stats
    this.clanLeaderboardsStatsService.getClanleaderboardStats(this.bungieAccount.clans[0], [ModeTypes.RAID]).then((clanLeaderboardsStats: IClanLeaderboardsStats) => {
      this.clanLeaderboardsStats = clanLeaderboardsStats;
      if ( this.clanLeaderboardsStats !== undefined ) {
        console.log("Leaderboard stats found");
        // let myLbString = JSON.stringify(clanLeaderboardsStats, null, 4);
        // console.log("Leaderboard stats: " + myLbString);
      } else {
        console.log("Leaderboard statId not found!");
      }
      
    });
  }

}
