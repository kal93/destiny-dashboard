import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { PerkDefinition } from 'app/bungie/manifest/interfaces';

@Component({
  selector: 'dd-inventory-item-perk',
  templateUrl: './inventory-item-perk.component.html',
  styleUrls: ['./inventory-item-perk.component.scss']
})
export class InventoryItemPerkComponent {
  @Input()
  perk: PerkDefinition;

  constructor(public domSanitizer: DomSanitizer) {
  }

  ngOnInit() {
  }
}