import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AvailableQuest, MilestoneBase, QuestActivity } from '../../services/interface.barrel';
import { DestinyInventoryItemDefinition } from "app/bungie/manifest/interfaces";
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

  constructor(public domSanitizer: DomSanitizer, private manifestService: ManifestService) { }

  ngOnInit() {
    // If we have not found any quests that are incomplete
    if (this.milestone.availableQuests != null) {
      this.isComplete = (this.milestone.availableQuests.find((quest) => { return !quest.status.completed }) == null);

      // If exactly one, let's get some detail about it
      if (this.isNightfall && this.milestone.availableQuests.length == 1) {
        this.nightfallQuest = this.milestone.availableQuests[0];
        console.log(this.nightfallQuest);
      }

    }
    //bungie.net/img/destiny_content/pgcr/

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