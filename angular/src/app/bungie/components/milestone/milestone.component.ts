import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { InventoryItem, MilestoneBase } from '../../services/interface.barrel';
import { DestinyInventoryItemDefinition } from "app/bungie/manifest/interfaces";

@Component({
  selector: 'dd-milestone',
  templateUrl: './milestone.component.html',
  styleUrls: ['./milestone.component.scss']
})
export class MilestoneComponent {
  @Input()
  milestone: MilestoneBase;

  isComplete: boolean = false;
  isStarted: boolean = false;

  constructor(public domSanitizer: DomSanitizer) { }

  ngOnInit() {

    // If we have not found any quests that are incomplete
    if (this.milestone.availableQuests != null) {
      this.isComplete = (this.milestone.availableQuests.find((quest) => { return !quest.status.completed }) == null);
      this.isStarted = (this.milestone.availableQuests.find((quest) => { return !quest.status.started }) == null);
    }

    this.milestone.startDate = <any>new Date(this.milestone.startDate);
    this.milestone.endDate = <any>new Date(this.milestone.endDate);
  }
}