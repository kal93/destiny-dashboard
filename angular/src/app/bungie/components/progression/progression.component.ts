import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FactionBase, ProgressionBase } from '../../services/interface.barrel';
import { DestinyInventoryItemDefinition, DestinyFactionDefinition, DestinyProgressionDefinition } from "app/bungie/manifest/interfaces";

@Component({
  selector: 'dd-progression',
  templateUrl: './progression.component.html',
  styleUrls: ['./progression.component.scss']
})
export class ProgressionComponent {
  @Input()
  progression: ProgressionBase | FactionBase;

  @Input()
  definition: DestinyProgressionDefinition | DestinyFactionDefinition;

  constructor(public domSanitizer: DomSanitizer) { }

  ngOnInit() {
    console.log(this.progression);

  }
}