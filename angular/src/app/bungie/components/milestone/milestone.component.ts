import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AvailableQuest, MilestoneBase, QuestActivity } from '../../services/interface.barrel';
import { DestinyActivityModifierDefinition, DestinyInventoryItemDefinition, DestinyObjectiveDefinition } from "app/bungie/manifest/interfaces";
import { ManifestService } from 'app/bungie/manifest/manifest.service';

@Component({
  selector: 'dd-milestone',
  templateUrl: './milestone.component.html',
  styleUrls: ['./milestone.component.scss']
})
export class MilestoneComponent {
  @Input()
  milestone: MilestoneBase;

  @Input()
  isNightfall: boolean = false;

  isComplete: boolean = false;

  questRewardItemDefinitions = new Array<DestinyInventoryItemDefinition>();

  nightfallQuest: AvailableQuest;
  nightfallModifiers = new Array<DestinyActivityModifierDefinition>();
  nightfallChallenges = new Array<DestinyObjectiveDefinition>();

  tempActivityModiferHashValues = new Map<number, DestinyActivityModifierDefinition>();

  constructor(public domSanitizer: DomSanitizer, private manifestService: ManifestService) {
    this.tempActivityModiferHashValues.set(4293009546, { name: "Prism", description: "Your attacks matching the focused element deal increased damage. All other elemental damage is reduced. Kinetic and incoming damage is unaffected. The focused element rotates periodically." });
    this.tempActivityModiferHashValues.set(458112752, { name: "Timewarp: Rings", description: "Vex time gates have appeared in the area. Pass through them to discharge temporal energy and extend the mission timer." });
  }

  ngOnInit() {
    // If we have not found any quests that are incomplete
    if (this.milestone.availableQuests != null) {
      this.isComplete = (this.milestone.availableQuests.find((quest) => { return !quest.status.completed }) == null);

      // If exactly one, let's get some detail about it
      if (this.isNightfall && this.milestone.availableQuests.length == 1) {
        this.nightfallQuest = this.milestone.availableQuests[0];
        if (this.nightfallQuest == null || this.nightfallQuest.activity == null || this.nightfallQuest.challenges == null) {
          console.error("nightfallQuest was null");
          return;
        }

        this.nightfallModifiers = new Array<DestinyActivityModifierDefinition>();
        // Change once ActivityModifiers are not private any more
        // Get nightfall modifiers
        this.nightfallQuest.activity.modifierHashes.forEach((modifierHash) => {
          this.nightfallModifiers.push(this.tempActivityModiferHashValues.get(modifierHash));
        });

        this.nightfallChallenges = new Array<DestinyObjectiveDefinition>();
        // Get nightfall challenges
        this.nightfallQuest.challenges.forEach((challenge) => {
          if (challenge.objective.activityHash == this.nightfallQuest.activity.activityHash)
            this.nightfallChallenges.push(this.manifestService.getManifestEntry("DestinyObjectiveDefinition", challenge.objective.objectiveHash));
        });
      }
    }

    this.milestone.startDate = <any>new Date(this.milestone.startDate);
    this.milestone.endDate = <any>new Date(this.milestone.endDate);

    let questRewardItemHashesMap = new Map<number, boolean>();

    // Search milestone quests to get rewards
    this.milestone.milestoneValue.questsData.forEach((quest) => {
      if (quest.questRewards != null)
        quest.questRewards.items.forEach((questReward) => {
          if (!questRewardItemHashesMap.has(questReward.itemHash))
            questRewardItemHashesMap.set(questReward.itemHash, true);
        });
    });

    // Search rewards on actual milestone 
    if (this.milestone.rewards != null)
      this.milestone.rewards.forEach((milestoneReward) => {
        milestoneReward.entries.forEach((reward) => {
          if (!questRewardItemHashesMap.has(reward.rewardEntryHash))
            questRewardItemHashesMap.set(reward.rewardEntryHash, true);
        });
      });

    questRewardItemHashesMap.forEach((selected, itemHash) => {
      let inventoryItemDefinition: DestinyInventoryItemDefinition = this.manifestService.getManifestEntry("DestinyInventoryItemDefinition", itemHash);
      if (inventoryItemDefinition != null)
        this.questRewardItemDefinitions.push(inventoryItemDefinition);
    });

  }
}