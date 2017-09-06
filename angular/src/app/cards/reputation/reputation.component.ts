import { Component, ViewChild } from '@angular/core';
import { MdTabGroup } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { PrivacyTypes } from 'app/bungie/services/enums.interface';

import { AccountSummaryService, CharacterProgressionService } from 'app/bungie/services/service.barrel';
import { DestinyMembership, IAccountSummary, ProgressionBase } from 'app/bungie/services/interface.barrel';

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
  characterProgressions: Array<ProgressionBase>;
  progressionPrivacy;

  accountNotFound: boolean = false;

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

    this.accountNotFound = false;
    this.accountSummaryService.getAccountSummary(this.selectedMembership).then((accountSummary: IAccountSummary) => {
      this.accountSummary = accountSummary;
      if (this.accountSummary == null) {
        this.accountNotFound = true;
        return;
      }

      if (this.selectedTabIndex > accountSummary.characterData.length - 1)
        this.selectedTabIndex = 0;

      this.tabGroup.selectedIndex = this.selectedTabIndex;
      this.selectedTabIndexChanged(this.selectedTabIndex);
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
    this.getSelectedRep();
  }

  getSelectedRep() {
    let characterId: string = this.accountSummary.characterData[this.selectedTabIndex].characterId;

    this.characterProgressionService.getCharacterProgression(this.selectedMembership, characterId).then((characterProgressionResponse) => {
      if (characterProgressionResponse == null)
        return;

      // Set progressions from API
      this.characterProgressions = characterProgressionResponse.progressionsData;
      this.progressionPrivacy = (characterProgressionResponse.progressions.privacy == PrivacyTypes.Private);

      // Filter out progressions we don't have a faction entry for, or if it's a negative level (Test faction probably)
      this.characterProgressions = this.characterProgressions.filter((progression) => {
        return progression.factionValue != null && progression.level != -1;
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
