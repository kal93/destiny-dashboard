import { Component, ViewChild } from '@angular/core';
import { MdTabGroup } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { PrivacyTypes } from 'app/bungie/services/enums.interface';

import { DestinyProfileService } from 'app/bungie/services/service.barrel';
import { DestinyMembership, IAccountSummary, FactionBase, ProgressionBase } from 'app/bungie/services/interface.barrel';

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
  characterFactions: Array<FactionBase>;
  characterProgressions: Array<ProgressionBase>;
  privacyError: boolean;

  accountNotFound: boolean = false;

  constructor(private destinyProfileService: DestinyProfileService, public domSanitizer: DomSanitizer, public sharedApp: SharedApp) {
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
        this.selectedTabIndex = 0;

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
    this.getSelectedCharacterProgression();
  }

  getSelectedCharacterProgression() {
    this.privacyError = false;

    this.characterFactions = null;
    this.characterProgressions = null;

    let characterId: string;
    try { characterId = this.accountSummary.characterData[this.selectedTabIndex].characterId; }
    catch (error) {
      console.error("Empty accountSummary in getSelectedRep.", error);
      return;
    }

    this.destinyProfileService.getCharacterProgression(this.selectedMembership, characterId, true).then((characterProgressions) => {
      if (characterProgressions == null)
        return;

      if (characterProgressions.progressions.privacy == PrivacyTypes.Private && characterProgressions.factionData.length == 0) {
        this.privacyError = true;
        return;
      }

      // Set progressions from API
      this.characterFactions = characterProgressions.factionData;

      // Filter out incomplete data
      this.characterProgressions = characterProgressions.progressionData.filter((progression) => { return progression.progressionValue.displayProperties.name != '' });

      // Sort progressions based on progress
      this.characterFactions.sort((a, b) => {
        //return a.factionValue.displayProperties.name > b.factionValue.displayProperties.name ? -1 : 1;
        if (a.level != b.level)
          return b.level - a.level;
        return b.progressToNextLevel - a.progressToNextLevel;
      });
    });
  }
}
