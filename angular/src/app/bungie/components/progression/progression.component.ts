import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FactionBase, ProgressionBase } from '../../services/interface.barrel';
import { DestinyInventoryItemDefinition, DestinyFactionDefinition, DestinyProgressionDefinition } from "app/bungie/manifest/interfaces";
import { SharedApp } from 'app/shared/services/shared-app.service';

@Component({
  selector: 'dd-progression',
  templateUrl: './progression.component.html',
  styleUrls: ['./progression.component.scss']
})
export class ProgressionComponent {
  @Input()
  progression: ProgressionBase & FactionBase;

  @Input()
  definition: DestinyProgressionDefinition | DestinyFactionDefinition;

  hideFactionItems: boolean = false;

  constructor(public domSanitizer: DomSanitizer, public sharedApp: SharedApp) { }

  ngOnInit() {
    this.hideFactionItems = this.sharedApp.accessToken == null || this.progression.factionInventoryItems == null || this.progression.factionInventoryItems.length == 0;

  }
}