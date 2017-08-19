import { Component, ViewChild } from '@angular/core';
import { MdToolbarModule, MdMenuModule } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { SharedBungie } from 'app/bungie/shared-bungie.service';
import { SharedApp } from 'app/shared/services/shared-app.service';

import { GetBungieAccountService, ClanLeaderboardsStatsService } from 'app/bungie/services/service.barrel';
import { DestinyMembership, IClanLeaderboardsStats, LbStats, IGetBungieAccount, BungieAccountClan, BungieGroupInfo } from 'app/bungie/services/interface.barrel';

import { fadeIn } from 'app/shared/animations';

@Component({
  selector: 'dd-clanleaderboards',
  templateUrl: './clanleaderboards.component.html',
  styleUrls: ['../_base/card.component.scss', './clanleaderboards.component.scss'],
  animations: [fadeIn()]
})

export class ClanLeaderboardsComponent extends CardComponent {
  CARD_DEFINITION_ID = 7;

  @ViewChild("statGroup")

  // Don't know why this is needed but removing it breaks the platform icon in the view toolbar
  selectedTabIndex: number = 0;

  // Current membership
  selectedMembership: DestinyMembership;

  // Bungie user account
  bungieAccount: IGetBungieAccount;
  bungieAccountRelatedGroups: BungieGroupInfo;

  // Initialize this in case first membership provided has no clan
  bungieClanName = "No Clan Found!";
  
  // Stat names for data and view Display
  statName: string;
  statDisplayName: string;

  // Clan leaderboard stats
  clanLeaderboardsStats: IClanLeaderboardsStats;
  lbSingleGameKills: LbStats;
  lbSingleGameScore: LbStats;
  lbMostPrecisionKills: LbStats;
  lbLongestKillSpree: LbStats;
  lbLongestSingleLife: LbStats;

  // Informational debug level can be 0, 1, or 2 where 0 is no infomational logging
  // Errors are still logged even at level 0
  debugLevel = 0;
  
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
    if ( this.debugLevel > 1 ) {
      let myMembershipString = JSON.stringify(this.selectedMembership);
      console.log("Membership info: " + myMembershipString);
    }

    // Get Bungie account info to retrieve clan groupId
    this.getBungieAccountService.getGetBungieAccount(this.selectedMembership).then((bungieAccount: IGetBungieAccount) => { 
      this.bungieAccount = bungieAccount;
      if ( this.debugLevel > 1 ) {
        let myBungieAccountString = JSON.stringify(this.bungieAccount);
        console.log("Bungie account: " + myBungieAccountString);
      }

      if ( this.bungieAccount.clans[0] !== undefined ) {
        if (this.debugLevel > 0 ) {
          console.log("Clan object found");
        }
        if ( this.debugLevel > 1 ) {
          let myClanString = JSON.stringify(this.bungieAccount.clans[0], null, 4);
          console.log("Clan info: " + myClanString);
        }

        if ( this.bungieAccount.clans[0].groupId !== undefined ) {
          if ( this.debugLevel > 0 ) {
            console.log("Clan groupId: " + this.bungieAccount.clans[0].groupId);
          }

          // Call stats function to get leaderboard stats for initial view which is raid stats (modes=4)
          this.statName = "raid";
          this.statDisplayName = "Raid";
          this.getLbStats(4);

          // Set shorter variable name to use in with odd relatedGroups data to get clan name
          let bungieClanGroupId = this.bungieAccount.clans[0].groupId;
  
          if ( this.bungieAccount.relatedGroups[bungieClanGroupId] !== undefined ) {
            this.bungieAccountRelatedGroups = bungieAccount.relatedGroups[bungieClanGroupId];
            if ( this.debugLevel > 0 ) {
              console.log("relatedGroups found");
            }
            if ( this.debugLevel > 1 ) {
              let myRgString = JSON.stringify(this.bungieAccountRelatedGroups);
              console.log("relatedGroups: " + myRgString);
            }

            if ( this.bungieAccountRelatedGroups.name !== undefined ) {
              // Overwrite default with actual clan name
              this.bungieClanName = this.bungieAccountRelatedGroups.name;
              if ( this.debugLevel > 0 ) {
                console.log("Clan name: " + this.bungieClanName);
              }

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
        this.clanLeaderboardsStats = null;
        console.log("Clans array not found!");
      }
      
    });
  }


   getLbStats( mode: number ) {
    
    // Service accepts an array of modes so put our mode into an array
    let modes = [];
    modes = [mode];

    if ( this.debugLevel > 0 ) {
     console.log("modes= " + modes);
    }

    // Clear stats since some stats are optional for some modes
    //   and we don't want garbage data to be kept by accident
    this.clanLeaderboardsStats = null;
    this.lbSingleGameKills = null;
    this.lbMostPrecisionKills = null;
    this.lbLongestKillSpree = null;
    this.lbLongestSingleLife = null;
    this.lbSingleGameScore = null;

    // Get clan leaderboard stats
    this.clanLeaderboardsStatsService.getClanleaderboardStats(this.bungieAccount.clans[0], modes).then((clanLeaderboardsStats: IClanLeaderboardsStats) => {
      this.clanLeaderboardsStats = clanLeaderboardsStats;
      
      if ( this.clanLeaderboardsStats !== undefined ) {
        if ( this.debugLevel > 0 ) {
          console.log("Leaderboard stats found");
        } else if ( this. debugLevel > 1 ) {
          let myLbString = JSON.stringify(clanLeaderboardsStats, null, 4);
          console.log("Leaderboard stats: " + myLbString);
        }

        // Make a simple variable to help with readability in this next block
        let statName = this.statName;
        if ( this.clanLeaderboardsStats[statName] !== undefined ) {
          if ( this.clanLeaderboardsStats[statName].lbSingleGameKills !== undefined ) {
            this.lbSingleGameKills = this.clanLeaderboardsStats[statName].lbSingleGameKills;
          }
          if ( this.clanLeaderboardsStats[statName].lbMostPrecisionKills !== undefined ) {
            this.lbMostPrecisionKills = this.clanLeaderboardsStats[statName].lbMostPrecisionKills;
          }
          if ( this.clanLeaderboardsStats[statName].lbLongestKillSpree !== undefined ) {
            this.lbLongestKillSpree = this.clanLeaderboardsStats[statName].lbLongestKillSpree;
          }
          if ( this.clanLeaderboardsStats[statName].lbLongestSingleLife !== undefined ) {
            this.lbLongestSingleLife = this.clanLeaderboardsStats[statName].lbLongestSingleLife;
          }
          if ( this.clanLeaderboardsStats[statName].lbSingleGameScore !== undefined ) {
            this.lbSingleGameScore = this.clanLeaderboardsStats[statName].lbSingleGameScore;
          }
        } else {
          console.log("Leaderboard stats for: " + statName + "not found!");
        }
        
      } else {
        console.log("Leaderboard statId not found!");
      }
      
    });
  }

  getStatName(modeNumber: number) : string {
    
    // Convert stat mode numbers to mode names for the data call and a people friendly name for the view
    // Keeping options list to six for a mobile friendly option pulldown size
    switch (modeNumber) {
      case 4: 
        this.statDisplayName = "Raid";
        this.statName = "raid"
        break;
      case 5: 
        this.statDisplayName = "All PvP";
        this.statName = "allPvP";
        break;
      case 7: 
        this.statDisplayName = "All PvE";
        this.statName = "allPvE";
        break;
      case 14: 
        this.statDisplayName = "Trials Of Osiris";
        this.statName = "trialsOfOsiris";
        break;
      case 16: 
        this.statDisplayName = "Nightfall";
        this.statName = "nightfall";
        break;
      case 18: 
        this.statDisplayName = "All Strikes";
        this.statName = "allStrikes";
        break;
      default:  
        this.statDisplayName = "Not Configured";
        this.statName = "notConfigured";
    }
  return this.statName;

  }

  statsChanged(newMode: number) {

    if ( this.debugLevel > 0 ) {
      console.log("New Mode= " + newMode);
    }

    // Get/set new statName and statDisplayname for view
    this.statName = this.getStatName(newMode);

    if ( this.debugLevel > 0 ) {
      console.log("New StatName= " + this.statName);
    }

    // Update stats for new stat selection
    this.getLbStats(newMode);

  }

}
