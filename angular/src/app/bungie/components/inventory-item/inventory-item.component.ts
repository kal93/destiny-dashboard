import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { InventoryItem } from '../../services/interface.barrel';

@Component({
  selector: 'dd-inventory-item',
  templateUrl: './inventory-item.component.html',
  styleUrls: ['./inventory-item.component.scss']
})
export class InventoryItemComponent {
  @Input()
  inventoryItem: InventoryItem;
  @Input()
  equipped: boolean;
  @Input()
  selected: boolean;

  @Input()
  disablePopup: boolean = false;

  @Output()
  longPress = new EventEmitter<void>();

  @Output()
  clicked = new EventEmitter<void>();

  // 0=nothing, 1=kinetic, 2=arc, 3=solar, 4=void
  damageTypeColors = ["#2A333E", "#2A333E", "#84C4EB", "#F36F26", "#B082CB"];

  constructor(public domSanitizer: DomSanitizer) { }

  click() {
    console.log(this.inventoryItem);

    // If a parent component is listening to the click event
    this.clicked.emit();

    if (this.disablePopup)
      return;

  }
}