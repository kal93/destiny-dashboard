import { Component, ViewChild } from '@angular/core';
import { MdTabGroup } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { AccountSummaryService, CharacterProgressionService } from 'app/bungie/services/service.barrel';

import { DestinyMembership, IAccountSummary, Progression, SummaryCharacter } from 'app/bungie/services/interface.barrel';

@Component({
  selector: 'dd-reputation',
  templateUrl: './reputation.component.html',
  styleUrls: ['../_base/card.component.scss', './reputation.component.scss']
})
export class ReputationComponent extends CardComponent {
  CARD_DEFINITION_ID = 1;

  @ViewChild("tabGroup")
  tabGroup: MdTabGroup;

  selectedTabIndex: number = 0;

  // Current membership
  selectedMembership: DestinyMembership;

  // Account summary with characters
  accountSummary: IAccountSummary;

  // Progression (Reputation) for selected character
  characterProgressions: Array<Progression>;

  constructor(private accountSummaryService: AccountSummaryService, private characterProgressionService: CharacterProgressionService, public domSanitizer: DomSanitizer,
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

    //Get Account Summary to get the list of available characters
    this.accountSummaryService.getAccountSummary(this.selectedMembership).then((accountSummary: IAccountSummary) => {
      this.accountSummary = accountSummary;
      this.accountSummary.characters.forEach((character: SummaryCharacter) => {
        character.characterBase.classValue = this.manifestService.getManifestEntry("DestinyClassDefinition", character.characterBase.classHash);
        character.characterBase.genderValue = this.manifestService.getManifestEntry("DestinyGenderDefinition", character.characterBase.genderHash);
        character.characterBase.raceValue = this.manifestService.getManifestEntry("DestinyRaceDefinition", character.characterBase.raceHash);
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
    this.getSelectedRep();
  }

  getSelectedRep() {
    let characterId: string = this.accountSummary.characters[this.selectedTabIndex].characterBase.characterId;

    //Create a map for the relationship from DestinyFactionDefinition to DestinyProgressDefinition
    let progressionHashFactionMap = new Map<number, any>();
    let factionMap = this.manifestService.getTableMap("DestinyFactionDefinition");
    factionMap.forEach((value, key) => {
      if (value.progressionHash != 0)
        progressionHashFactionMap.set(value.progressionHash, value);
    });

    this.characterProgressionService.getCharacterProgression(this.selectedMembership, characterId).then((characterProgressionResponse) => {
      // Set progressions from API
      this.characterProgressions = characterProgressionResponse.progressions;

      // Set the manifest value for the given progression hash
      this.characterProgressions.forEach((progression) => {
        let factionValue = progressionHashFactionMap.get(progression.progressionHash);

        // Set the faction if it exists
        if (factionValue != null) {
          progression.factionValue = factionValue;
          progression.progressionValue = this.manifestService.getManifestEntry("DestinyProgressionDefinition", progression.progressionHash);
        }
      });

      // Filter out progressions we don't have a faction entry for, or if it's a negative level (Test faction probably)
      this.characterProgressions = this.characterProgressions.filter((progression) => {
        return progression.factionValue != null && progression.level != -1 && progression.progressionHash != 452808717;
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
