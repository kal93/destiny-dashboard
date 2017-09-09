import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from 'app/shared/services/shared-app.service';

import { DestinyStatsService, DestinyGroupService } from 'app/bungie/services/service.barrel';
import { IGroupV2User, LbStats, DestinyMembership, IClanLeaderboardsStats } from 'app/bungie/services/interface.barrel';

import { slideFromBottom, slowFadeIn } from 'app/shared/animations';

@Component({
  selector: 'dd-clan-leaderboards',
  templateUrl: './clan-leaderboards.component.html',
  styleUrls: ['../_base/card.component.scss', './clan-leaderboards.component.scss'],
  animations: [slideFromBottom(), slowFadeIn()]
})

export class ClanLeaderboardsComponent extends CardComponent {
  CARD_DEFINITION_ID = 7;
  // Current membership
  selectedMembership: DestinyMembership;
  // Clan Group Info
  groupV2User: IGroupV2User;
  bungieClanId: number;
  // Initialize this in case first membership provided has no clan
  bungieClanName: string;
  clanApiError: boolean = false;
  userPrivacyError: boolean = false;
  // Stat names for data and view Display
  statName: string;
  statDisplayName: string;
  // Clan leaderboard stats
  clanLeaderboardsStats: IClanLeaderboardsStats;
  lbSingleGameKills: LbStats = null;
  lbPrecisionKills: LbStats = null;
  lbAssists: LbStats = null;
  lbDeaths: LbStats = null;
  lbKills: LbStats = null;
  lbObjectivesCompleted: LbStats = null;
  lbSingleGameScore?: LbStats = null;
  lbMostPrecisionKills: LbStats = null;
  lbLongestKillSpree: LbStats = null;
  lbLongestKillDistance: LbStats = null;
  lbFastestCompletionMs: LbStats = null;
  lbLongestSingleLife: LbStats = null;

  constructor(private destinyStatsService: DestinyStatsService, public domSanitizer: DomSanitizer, private destinyGroupService: DestinyGroupService,
    public sharedApp: SharedApp) {
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

    // Reset variables
    this.clanApiError = this.userPrivacyError = false;
    this.clanLeaderboardsStats = null;

    // Get Bungie account info to retrieve clan groupId (filter=0, groupType=1)
    this.destinyGroupService.getGroupV2User(this.selectedMembership, 0, 1).then((groupV2User: IGroupV2User) => {
      this.groupV2User = groupV2User;
      // A given Destiny membership should either be in 1 or 0 clans
      // Test for the case of 0 which means no clan found
      if (this.groupV2User.totalResults == 0 ) {
        this.bungieClanName = "No Clan found!";
        this.clanApiError = true;
        return;
      }
      if (this.groupV2User.results == null) {
        this.bungieClanName = "No Clan found!";
        this.userPrivacyError = true;
        return;
      }

      // If it didn't find 0 or null, then it should have found 1 so we proceed with an array index of 0
      if (this.groupV2User.results[0].group.groupId != null && this.groupV2User.results[0].group.name != null) {
        this.bungieClanId = groupV2User.results[0].group.groupId;
        this.bungieClanName = this.groupV2User.results[0].group.name;
        // Call stats function to get leaderboard stats for initial view which is story stats (modes=2)
        this.statName = "story";
        this.statDisplayName = "Story";
        this.getLbStats(2);
      // This should never occur, but just in case...
      } else { 
        this.bungieClanName = "No Clan found!";
        this.clanApiError = true;
        return; 
      }
    });
  }

  getLbStats(mode: number) {
    if (this.bungieClanName == null || this.bungieClanId == null)
      return;
    // Clear stats since some stats are optional for some modes
    //   and we don't want garbage data to be kept by accident
    this.lbSingleGameKills = null;
    this.lbPrecisionKills = null;
    this.lbAssists = null;
    this.lbDeaths = null;
    this.lbKills = null;
    this.lbObjectivesCompleted = null;
    this.lbSingleGameScore = null;
    this.lbMostPrecisionKills = null;
    this.lbLongestKillSpree = null;
    this.lbLongestKillDistance = null;
    this.lbFastestCompletionMs = null;
    this.lbLongestSingleLife = null;

    // Get clan leaderboard stats
    this.destinyStatsService.getClanleaderboardStats(this.bungieClanId, [mode]).then((clanLeaderboardsStats: IClanLeaderboardsStats) => {
      this.clanLeaderboardsStats = clanLeaderboardsStats;
      if (this.clanLeaderboardsStats != null) {
        // Make a simple variable to help with readability in this next block
        let statName = this.clanLeaderboardsStats[this.statName];
        if (statName != null) {
          this.lbSingleGameKills = statName.lbSingleGameKills;
          this.lbPrecisionKills = statName.lbPrecisionKills;
          this.lbAssists = statName.lbAssists;
          this.lbDeaths = statName.lbDeaths;
          this.lbKills = statName.lbKills;
          this.lbObjectivesCompleted = statName.lbObjectivesCompleted;
          this.lbSingleGameScore = statName.lbSingleGameScore
          this.lbMostPrecisionKills = statName.lbMostPrecisionKills;
          this.lbLongestKillSpree = statName.lbLongestKillSpree;
          this.lbLongestKillDistance = statName.lbLongestKillDistance;
          this.lbFastestCompletionMs = statName.lbFastestCompletionMs;
          this.lbLongestSingleLife = statName.lbLongestSingleLife
        }
      }

      // The returned data we want to display is incredibly inconsistent!
      // To make it simpler to test in the view we will null out data that is useless
      if (this.lbSingleGameKills != null) {
        if (!this.lbSingleGameKills.entries) {
          this.lbSingleGameKills = null;
        } else if (!this.lbSingleGameKills.entries.length) {
          this.lbSingleGameKills = null;
        } else if (!this.lbSingleGameKills.entries[0].value.basic.value) {
          this.lbSingleGameKills = null;
        };
      };

      if (this.lbPrecisionKills != null) {
        if (!this.lbPrecisionKills.entries) {
          this.lbPrecisionKills = null;
        } else if (!this.lbPrecisionKills.entries.length) {
          this.lbPrecisionKills = null;
        } else if (!this.lbPrecisionKills.entries[0].value.basic.value) {
          this.lbPrecisionKills = null;
        };
      };

      if (this.lbAssists != null) {
        if (!this.lbAssists.entries) {
          this.lbAssists = null;
        } else if (!this.lbAssists.entries.length) {
          this.lbAssists = null;
        } else if (!this.lbAssists.entries[0].value.basic.value) {
          this.lbAssists = null;
        };
      };

      if (this.lbDeaths != null) {
        if (!this.lbDeaths.entries) {
          this.lbDeaths = null;
        } else if (!this.lbDeaths.entries.length) {
          this.lbDeaths = null;
        } else if (!this.lbDeaths.entries[0].value.basic.value) {
          this.lbDeaths = null;
        };
      };

      if (this.lbKills != null) {
        if (!this.lbKills.entries) {
          this.lbKills = null;
        } else if (!this.lbKills.entries.length) {
          this.lbKills = null;
        } else if (!this.lbKills.entries[0].value.basic.value) {
          this.lbKills = null;
        };
      }

      if (this.lbObjectivesCompleted != null) {
        if (!this.lbObjectivesCompleted.entries) {
          this.lbObjectivesCompleted = null;
        } else if (!this.lbObjectivesCompleted.entries.length) {
          this.lbObjectivesCompleted = null;
        } else if (!this.lbObjectivesCompleted.entries[0].value.basic.value) {
          this.lbObjectivesCompleted = null;
        };
      }

      if (this.lbSingleGameScore != null) {
        if (!this.lbSingleGameScore.entries) {
          this.lbSingleGameScore = null;
        } else if (!this.lbSingleGameScore.entries.length) {
          this.lbSingleGameScore = null;
        } else if (!this.lbSingleGameScore.entries[0].value.basic.value) {
          this.lbSingleGameScore = null;
        };
      }

      if (this.lbMostPrecisionKills != null) {
        if (!this.lbMostPrecisionKills.entries) {
          this.lbMostPrecisionKills = null;
        } else if (!this.lbMostPrecisionKills.entries.length) {
          this.lbMostPrecisionKills = null;
        } else if (!this.lbMostPrecisionKills.entries[0].value.basic.value) {
          this.lbMostPrecisionKills = null;
        };
      }

      if (this.lbLongestKillSpree != null) {
        if (!this.lbLongestKillSpree.entries) {
          this.lbLongestKillSpree = null;
        } else if (!this.lbLongestKillSpree.entries.length) {
          this.lbLongestKillSpree = null;
        } else if (!this.lbLongestKillSpree.entries[0].value.basic.value) {
          this.lbLongestKillSpree = null;
        };
      }

      if (this.lbLongestKillDistance != null) {
        if (!this.lbLongestKillDistance.entries) {
          this.lbLongestKillDistance = null;
        } else if (!this.lbLongestKillDistance.entries.length) {
          this.lbLongestKillDistance = null;
        } else if (!this.lbLongestKillDistance.entries[0].value.basic.value) {
          this.lbLongestKillDistance = null;
        };
      }

      if (this.lbFastestCompletionMs != null) {
        if (!this.lbFastestCompletionMs.entries) {
          this.lbFastestCompletionMs = null;
        } else if (!this.lbFastestCompletionMs.entries.length) {
          this.lbFastestCompletionMs = null;
        } else if (!this.lbFastestCompletionMs.entries[0].value.basic.value) {
          this.lbFastestCompletionMs = null;
        };
      }

      if (this.lbLongestSingleLife != null) {
        if (!this.lbLongestSingleLife.entries) {
          this.lbLongestSingleLife = null;
        } else if (!this.lbLongestSingleLife.entries.length) {
          this.lbLongestSingleLife = null;
        } else if (!this.lbLongestSingleLife.entries[0].value.basic.value) {
          this.lbLongestSingleLife = null;
        };
      }

    });
  }

  getStatName(modeNumber: number): string {
    // Convert stat mode numbers to mode names for the data call and a people friendly name for the view
    // Keeping options list to a subset of available modes for a mobile friendly option pulldown size
    switch (modeNumber) {
      case 2:
        this.statDisplayName = "Story";
        this.statName = "story"
        break;
      case 5:
        this.statDisplayName = "All PvP";
        this.statName = "allPvP";
        break;
      case 7:
        this.statDisplayName = "All PvE";
        this.statName = "allPvE";
        break;
      case 10:
        this.statDisplayName = "Control";
        this.statName = "control";
        break;
      case 16:
        this.statDisplayName = "Nightfall";
        this.statName = "nightfall";
        break;
      case 18:
        this.statDisplayName = "All Strikes";
        this.statName = "allStrikes";
        break;
      case 37:
        this.statDisplayName = "Survival";
        this.statName = "survival";
        break;
      case 38:
        this.statDisplayName = "Countdown";
        this.statName = "countdown";
        break;
      default:
        this.statDisplayName = "Not Configured";
        this.statName = "notConfigured";
    }
    return this.statName;
  }

  statsChanged(newMode: number) {
    // Get/set new statName and statDisplayname for view
    this.statName = this.getStatName(newMode);

    // Update stats for new stat selection
    this.getLbStats(newMode);
  }

}
