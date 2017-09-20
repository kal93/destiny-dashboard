import { Component, ViewChild } from '@angular/core';
import { MdTabGroup } from '@angular/material';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { DestinyAccountService, DestinyProfileService } from 'app/bungie/services/service.barrel';

import { GroupTypes, ModeTypes, PeriodTypes } from 'app/bungie/services/enums.interface';
import { CharacterBase, DestinyMembership, IAccountStats, IAccountSummary, ICharacterStats } from 'app/bungie/services/interface.barrel';

@Component({
  selector: 'dd-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['../_base/card.component.scss', './stats.component.scss']
})
export class StatsComponent extends CardComponent {
  CARD_DEFINITION_ID = 1;

  @ViewChild("tabGroup")
  tabGroup: MdTabGroup;

  selectedTabIndex: number = 1;

  // Current membership
  selectedMembership: DestinyMembership;

  // Overall account stats
  accountStats: IAccountStats;
  accountStatsWeapons: Array<{ displayName: string, value: string }>;

  accountSummary: IAccountSummary;

  // Stats for selected character
  characterStats: ICharacterStats;

  accountNotFound: boolean = false;

  constructor(private destinyAccountService: DestinyAccountService, private destinyProfileService: DestinyProfileService,
    private manifestService: ManifestService, public sharedApp: SharedApp) {
    super(sharedApp);
  }

  ngOnInit() {
    super.ngOnInit();

    //Load previously selected tab index
    this.selectedTabIndex = +this.getCardLocalStorage("selectedTabIndex", 0);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  membershipSelected(selectedMembership: DestinyMembership) {
    this.selectedMembership = selectedMembership;

    this.accountNotFound = false;
    this.destinyProfileService.getAccountSummary(this.selectedMembership).then((accountSummary: IAccountSummary) => {
      this.accountSummary = accountSummary;
      if (this.accountSummary == null) {
        this.accountNotFound = true;
        return;
      }

      if (this.selectedTabIndex > accountSummary.characterData.length - 1)
        this.selectedTabIndex = 1;

      // Don't change the selected tab if it hasn't been set yet, since setting it will call this function 
      if (this.tabGroup.selectedIndex != -1)
        this.selectedTabIndexChanged(this.selectedTabIndex);

      this.tabGroup.selectedIndex = this.selectedTabIndex;
    });
  }

  selectedTabIndexChanged(targetCharacterIndex: number) {
    if (this.accountSummary == null) {
      this.accountNotFound = true;
      return;
    }

    //Set new character tab index
    this.selectedTabIndex = targetCharacterIndex;

    //Save the selected tab index
    this.setCardLocalStorage("selectedTabIndex", this.selectedTabIndex);

    //Get data for the newly selected character
    // Index 0 is the summary. Characters are index 1- 3
    /* if (this.selectedTabIndex == 0) {
       // Get a summary of the account statistics
       this.destinyAccountService.getAccountStats(this.selectedMembership, [GroupTypes.GENERAL, GroupTypes.WEAPONS]).then((accountStats: IAccountStats) => {
         this.accountStats = accountStats;
         this.setAccountStatsWeapons();
       });
     }
     else {*/
    let characterId: string = this.accountSummary.characterData[this.selectedTabIndex].characterId;
    this.destinyAccountService.getCharacterStats(this.selectedMembership, characterId, [GroupTypes.GENERAL], [ModeTypes.AllPvE, ModeTypes.AllPvP], PeriodTypes.ALLTIME).then((characterStats: ICharacterStats) => {
      this.characterStats = characterStats;
    });
    //}
  }

  private setAccountStatsWeapons() {
    if (this.accountStats == null)
      return;

    // Create an array of account weapon stats so we can sort by value 
    this.accountStatsWeapons = new Array<{ displayName: string, value: string }>();

    // Create an alias for this long nammed variable
    let PvEAllTime;
    try { PvEAllTime = this.accountStats.mergedAllCharacters.results.allPvE.allTime; }
    catch (error) {
      console.error("PvEAllTime was null");
      return;
    }
    this.accountStatsWeapons.push({ displayName: "Auto Rifle Kills", value: PvEAllTime.weaponKillsAutoRifle.basic.displayValue });
    this.accountStatsWeapons.push({ displayName: "Fusion Rifle Kills", value: PvEAllTime.weaponKillsFusionRifle.basic.displayValue });
    this.accountStatsWeapons.push({ displayName: "Grenade Kills", value: PvEAllTime.weaponKillsGrenade.basic.displayValue });
    this.accountStatsWeapons.push({ displayName: "Hand Cannon Kills", value: PvEAllTime.weaponKillsHandCannon.basic.displayValue });
    this.accountStatsWeapons.push({ displayName: "Pulse Rifle Kills", value: PvEAllTime.weaponKillsPulseRifle.basic.displayValue });
    this.accountStatsWeapons.push({ displayName: "Relic Kills", value: PvEAllTime.weaponKillsRelic.basic.displayValue });
    this.accountStatsWeapons.push({ displayName: "Rocket Kills", value: PvEAllTime.weaponKillsRocketLauncher.basic.displayValue });
    this.accountStatsWeapons.push({ displayName: "Scout Rifle Kills", value: PvEAllTime.weaponKillsScoutRifle.basic.displayValue });
    this.accountStatsWeapons.push({ displayName: "Shotgun Kills", value: PvEAllTime.weaponKillsShotgun.basic.displayValue });
    this.accountStatsWeapons.push({ displayName: "Sidearm Kills", value: PvEAllTime.weaponKillsSideArm.basic.displayValue });
    this.accountStatsWeapons.push({ displayName: "SMG Kills", value: PvEAllTime.weaponKillsSubmachinegun.basic.displayValue });
    this.accountStatsWeapons.push({ displayName: "Sniper Kills", value: PvEAllTime.weaponKillsSniper.basic.displayValue });
    this.accountStatsWeapons.push({ displayName: "Super Kills", value: PvEAllTime.weaponKillsSuper.basic.displayValue });
    this.accountStatsWeapons.push({ displayName: "Sword Kills", value: PvEAllTime.weaponKillsSword.basic.displayValue });
    this.accountStatsWeapons.sort((a, b) => {
      let aNum = parseInt(a.value);
      let bNum = parseInt(b.value);
      if (isNaN(aNum)) aNum = 0;
      if (isNaN(bNum)) bNum = 0;
      return bNum - aNum;
    });
  }
}
