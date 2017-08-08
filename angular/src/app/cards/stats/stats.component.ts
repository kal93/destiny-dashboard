import { Component, ViewChild } from '@angular/core';
import { MdTabGroup } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { SharedBungie } from '../../bungie/shared-bungie.service';
import { SharedApp } from '../../shared/services/shared-app.service';
import { ManifestService } from '../../bungie/manifest/manifest.service';
import { AccountStatsService, AccountSummaryService, CharacterProgressionService, CharacterStatsService } from '../../bungie/services/service.barrel';

import { GroupTypes, ModeTypes, PeriodTypes } from '../../bungie/services/enums.interface';
import { DestinyMembership, IAccountStats, IAccountSummary, ICharacterStats, Progression, SummaryCharacter } from '../../bungie/services/interface.barrel';

import { fadeIn } from '../../shared/animations';

@Component({
  selector: 'dd-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['../_base/card.component.scss', './stats.component.scss'],
  animations: [fadeIn()]
})
export class StatsComponent extends CardComponent {
  CARD_DEFINITION_ID = 1;

  @ViewChild("tabGroup")
  tabGroup: MdTabGroup;

  selectedTabIndex: number = 0;

  subTabItems: Array<string> = ["Stats", "Rep"];
  selectedSubTab: string = "Stats";

  // Current membership
  selectedMembership: DestinyMembership;

  // Overall account stats
  accountStats: IAccountStats;
  accountStatsWeapons: Array<{ displayName: string, value: string }>;

  // Account summary with characters
  accountSummary: IAccountSummary;

  // Stats for selected character
  characterStats: ICharacterStats;

  // Progression (Reputation) for selected character
  characterProgressions: Array<Progression>;

  constructor(private accountStatsService: AccountStatsService, private accountSummaryService: AccountSummaryService,
    private characterProgressionService: CharacterProgressionService, private characterStatsService: CharacterStatsService, public domSanitizer: DomSanitizer,
    private manifestService: ManifestService, private sharedBungie: SharedBungie, public sharedApp: SharedApp) {
    super(sharedApp);
  }

  ngOnInit() {
    super.ngOnInit();

    //Load previously selected tab index
    this.selectedTabIndex = +this.getCardLocalStorage("selectedTabIndex", 0);
    this.selectedSubTab = this.getCardLocalStorage("selectedSubTab", "Stats");
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  membershipSelected(selectedMembership: DestinyMembership) {
    this.selectedMembership = selectedMembership;

    //Get Account Summary to get the list of available characters
    this.accountSummaryService.getAccountSummary(this.selectedMembership).then((accountSummary: IAccountSummary) => {
      this.accountSummary = accountSummary;
      this.accountSummary.characters.forEach((character: SummaryCharacter) => {
        character.characterBase.classHashValue = this.manifestService.getManifestEntry("DestinyClassDefinition", character.characterBase.classHash);
        character.characterBase.genderHashValue = this.manifestService.getManifestEntry("DestinyGenderDefinition", character.characterBase.genderHash);
        character.characterBase.raceHashValue = this.manifestService.getManifestEntry("DestinyRaceDefinition", character.characterBase.raceHash);
      });

      this.tabGroup.selectedIndex = this.selectedTabIndex;
      this.selectedTabIndexChanged(this.selectedTabIndex);
    });
  }

  selectedTabIndexChanged(targetCharacterIndex: number) {
    //Set new character tab index
    this.selectedTabIndex = targetCharacterIndex;

    //Save the selected tab index
    this.setCardLocalStorage("selectedTabIndex", this.selectedTabIndex);

    //Get data for the newly selected character
    if (this.selectedTabIndex == 0 || this.selectedSubTab == "Stats")
      this.getSelectedStats();
    else if (this.selectedSubTab == "Rep")
      this.getSelectedRep();
  }

  selectedSubTabChanged(subTabItem) {
    this.selectedSubTab = subTabItem;
    this.setCardLocalStorage("selectedSubTab", this.selectedSubTab);

    if (this.selectedSubTab == "Stats")
      this.getSelectedStats();
    else if (this.selectedSubTab == "Rep")
      this.getSelectedRep();
  }

  getSelectedStats() {
    // Index 0 is the summary information.Characters are index 1- 3
    if (this.selectedTabIndex == 0) {
      // Get a summary of the account statistics
      this.accountStatsService.getAccountStats(this.selectedMembership, [GroupTypes.GENERAL, GroupTypes.WEAPONS]).then((accountStats: IAccountStats) => {
        this.accountStats = accountStats;
        this.setAccountStatsWeapons();
      });
    }
    else {
      var characterId: string = this.accountSummary.characters[this.selectedTabIndex - 1].characterBase.characterId;
      this.characterStatsService.getCharacterStats(this.selectedMembership, characterId, [GroupTypes.GENERAL], [ModeTypes.ALLPVE, ModeTypes.ALLPVP], PeriodTypes.ALLTIME).then((characterStats: ICharacterStats) => {
        this.characterStats = characterStats;
      });
      if (this.selectedSubTab == "Rep")
        this.getSelectedRep();
    }
  }

  getSelectedRep() {
    // 0 Should never happen, can't select rep if you're on the account summary
    if (this.selectedTabIndex == 0) { }
    else {
      var characterId: string = this.accountSummary.characters[this.selectedTabIndex - 1].characterBase.characterId;

      //Create a map for the relationship from DestinyFactionDefinition to DestinyProgressDefinition
      var progressionHashFactionMap = new Map<number, any>();
      var factionMap = this.manifestService.getTableMap("DestinyFactionDefinition");
      factionMap.forEach((value, key) => {
        if (value.progressionHash != 0)
          progressionHashFactionMap.set(value.progressionHash, value);
      });

      this.characterProgressionService.getCharacterProgression(this.selectedMembership, characterId).then((characterProgressionResponse) => {
        // Set progressions from API
        this.characterProgressions = characterProgressionResponse.progressions;

        // Set the manifest value for the given progression hash
        this.characterProgressions.forEach((progression) => {
          var factionHashValue = progressionHashFactionMap.get(progression.progressionHash);

          // Set the faction if it exists
          if (factionHashValue != null) {
            progression.factionHashValue = factionHashValue;
            progression.hashValue = this.manifestService.getManifestEntry("DestinyProgressionDefinition", progression.progressionHash);
          }
        });

        // Filter out progressions we don't have a faction entry for, or if it's a negative level (Test faction probably)
        this.characterProgressions = this.characterProgressions.filter((progression) => {
          return progression.factionHashValue != null && progression.level != -1;
        });

        // Sort progressions based on progress
        this.characterProgressions.sort((a, b) => {
          if (a.level != b.level)
            return b.level - a.level;
          return b.progressToNextLevel - a.progressToNextLevel;
        });
      });
    }
  }

  private setAccountStatsWeapons() {
    // Create an array of account weapon stats so we can sort by value 
    this.accountStatsWeapons = new Array<{ displayName: string, value: string }>();

    // Create an alias for this long nammed variable
    var PvEAllTime = this.accountStats.mergedAllCharacters.results.allPvE.allTime;
    this.accountStatsWeapons.push({ displayName: "Auto Rifle Kills", value: PvEAllTime.weaponKillsAutoRifle.basic.displayValue });
    this.accountStatsWeapons.push({ displayName: "Fusion Rifle Kills", value: PvEAllTime.weaponKillsFusionRifle.basic.displayValue });
    this.accountStatsWeapons.push({ displayName: "Grenade Kills", value: PvEAllTime.weaponKillsGrenade.basic.displayValue });
    this.accountStatsWeapons.push({ displayName: "Hand Cannon Kills", value: PvEAllTime.weaponKillsHandCannon.basic.displayValue });
    this.accountStatsWeapons.push({ displayName: "Machine Gun Kills", value: PvEAllTime.weaponKillsMachinegun.basic.displayValue });
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
      var aNum = parseInt(a.value);
      var bNum = parseInt(b.value);
      if (isNaN(aNum)) aNum = 0;
      if (isNaN(bNum)) bNum = 0;
      return bNum - aNum;
    });
  }
}
