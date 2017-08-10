import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { InventoryItem } from '../../services/interface.barrel';

@Component({
  selector: 'dd-inventory-item',
  templateUrl: './inventory-item.component.html',
  styleUrls: ['./inventory-item.component.scss']
})
export class InventoryItemComponent {
  @Input()
  public inventoryItem: InventoryItem;

  constructor(public domSanitizer: DomSanitizer) { }
}