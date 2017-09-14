import { Component, ViewChild } from '@angular/core';
import { MdTabGroup } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { MilestoneTypes, PrivacyTypes } from 'app/bungie/services/enums.interface';

import { DestinyMilestonesService, DestinyProfileService } from 'app/bungie/services/service.barrel';
import { DestinyMembership, IAccountSummary, MilestoneBase, PublicMilestoneBase } from 'app/bungie/services/interface.barrel';

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

  characterMilestoneNightfall: MilestoneBase;

  privacyError: boolean;

  accountNotFound: boolean = false;

  constructor(private destinyMilestonesService: DestinyMilestonesService, private destinyProfileService: DestinyProfileService, public domSanitizer: DomSanitizer,
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
    this.characterMilestonesOneTime = new Array<MilestoneBase>();
    this.characterMilestonesWeekly = new Array<MilestoneBase>();
    this.characterMilestonesDaily = new Array<MilestoneBase>();
    this.characterMilestonesSpecial = new Array<MilestoneBase>();

    let characterId: string;
    try { characterId = this.accountSummary.characterData[this.selectedTabIndex].characterId; }
    catch (error) {
      console.error("Empty accountSummary in getSelectedCharacterProgression.", error);
      return;
    }

    this.destinyMilestonesService.getPublicMilestones().then((publicMilestonesMap: { [key: number]: PublicMilestoneBase }) => {
      this.destinyProfileService.getCharacterProgression(this.selectedMembership, characterId).then((characterProgressions) => {
        if (characterProgressions == null)
          return;

        if (characterProgressions.progressions.privacy == PrivacyTypes.Private && characterProgressions.milestoneData.length == 0) {
          this.privacyError = true;
          return;
        }

        // Assign public milestone to each milestone so we can get modifier/challenges/etc
        characterProgressions.milestoneData.forEach((milestone) => {
          milestone.publicMilestone = publicMilestonesMap[milestone.milestoneHash];
        });

        // Special Milestones (Don't exist yet)
        this.characterMilestonesSpecial = characterProgressions.milestoneData.filter((milestone) => {
          return milestone.milestoneValue.milestoneType == MilestoneTypes.Special;
        });

        // Daily milestones
        this.characterMilestonesDaily = characterProgressions.milestoneData.filter((milestone) => {
          if (milestone.milestoneValue.milestoneType != MilestoneTypes.Daily) return false;

          //Filter out hotspot for now
          if (milestone.milestoneValue.friendlyName == "Hotspot") return false;
          return true;
        });

        // Weekly Milestones
        this.characterMilestonesWeekly = characterProgressions.milestoneData.filter((milestone) => {
          return milestone.milestoneValue.milestoneType == MilestoneTypes.Weekly;
        });

        // Get nightfall so we can put it first
        this.characterMilestoneNightfall = this.characterMilestonesWeekly.find((milestone) => { return milestone.milestoneValue.friendlyName == "Nightfall" });

        // Remove nightfall from standard weekly list
        this.characterMilestonesWeekly.splice(this.characterMilestonesWeekly.indexOf(this.characterMilestoneNightfall), 1);

        // One time milestones, not displayed
        //this.characterMilestonesOneTime = characterProgressions.milestoneData.filter((milestone) => {
        //   return milestone.milestoneValue.milestoneType == MilestoneTypes.OneTime;
        //});
      });

    });
  }
}
