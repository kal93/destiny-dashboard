import { Component, ViewChild } from '@angular/core';
import { MdTabGroup } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { MilestoneTypes, PrivacyTypes } from 'app/bungie/services/enums.interface';

import { DestinyProfileService } from 'app/bungie/services/service.barrel';
import { DestinyMembership, IAccountSummary, MilestoneBase } from 'app/bungie/services/interface.barrel';

@Component({
  selector: 'dd-milestones',
  templateUrl: './milestones.component.html',
  styleUrls: ['../_base/card.component.scss', './milestones.component.scss']
})
export class MilestonesComponent extends CardComponent {
  CARD_DEFINITION_ID = 1;

  @ViewChild("tabGroup")
  tabGroup: MdTabGroup;

  selectedTabIndex: number = 0;

  // Current membership
  selectedMembership: DestinyMembership;

  // Account summary with characters
  accountSummary: IAccountSummary;

  characterMilestonesOneTime: Array<MilestoneBase>;
  characterMilestonesWeekly: Array<MilestoneBase>;
  characterMilestonesDaily: Array<MilestoneBase>;
  characterMilestonesSpecial: Array<MilestoneBase>;

  privacyError: boolean;

  accountNotFound: boolean = false;

  constructor(private destinyProfileService: DestinyProfileService, public domSanitizer: DomSanitizer,
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
    this.getSelectedCharacterProgression();
  }

  getSelectedCharacterProgression() {
    let characterId: string;
    try { characterId = this.accountSummary.characterData[this.selectedTabIndex].characterId; }
    catch (error) {
      console.error("Empty accountSummary in getSelectedRep.", error);
      return;
    }

    if (this.sharedApp.accessToken == null) {
      this.privacyError = true;
    }
    else {
      this.destinyProfileService.getCharacterProgression(this.selectedMembership, characterId).then((characterProgressions) => {
        if (characterProgressions == null)
          return;

        this.characterMilestonesSpecial = characterProgressions.milestoneData.filter((milestone) => {
          return milestone.milestoneValue.milestoneType == MilestoneTypes.Special;
        });
        this.characterMilestonesDaily = characterProgressions.milestoneData.filter((milestone) => {
          return milestone.milestoneValue.milestoneType == MilestoneTypes.Daily;
        });
        this.characterMilestonesWeekly = characterProgressions.milestoneData.filter((milestone) => {
          return milestone.milestoneValue.milestoneType == MilestoneTypes.Weekly;
        });
        this.characterMilestonesOneTime = characterProgressions.milestoneData.filter((milestone) => {
          return milestone.milestoneValue.milestoneType == MilestoneTypes.OneTime;
        });

        //console.log(this.characterMilestonesSpecial);
        console.log(this.characterMilestonesDaily);
        console.log(this.characterMilestonesWeekly);
        console.log(this.characterMilestonesOneTime);

      });
    }
  }
}
