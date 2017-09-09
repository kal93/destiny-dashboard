import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AvailableQuest, InventoryItem } from '../../services/interface.barrel';
import { DestinyInventoryItemDefinition } from "app/bungie/manifest/interfaces";

@Component({
  selector: 'dd-quest',
  templateUrl: './quest.component.html',
  styleUrls: ['./quest.component.scss']
})
export class QuestComponent {
  @Input()
  quest: AvailableQuest;

  constructor(public domSanitizer: DomSanitizer) { }
}