import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { InventoryItem } from '../../services/interface.barrel';
import { DestinyInventoryItemDefinition, QuestBase } from "app/bungie/manifest/interfaces";

/* Not currently used in the app */
@Component({
  selector: 'dd-quest',
  templateUrl: './quest.component.html',
  styleUrls: ['./quest.component.scss']
})
export class QuestComponent {
  @Input()
  quest: QuestBase;

  constructor(public domSanitizer: DomSanitizer) { }

  ngOnInit() {
    console.log(this.quest);
  }
}