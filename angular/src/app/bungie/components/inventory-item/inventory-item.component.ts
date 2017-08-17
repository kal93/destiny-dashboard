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

  constructor(public domSanitizer: DomSanitizer) { }

  click() {
    console.log("click");

    // If a parent component is listening to the click event
    this.clicked.emit();

    if (this.disablePopup)
      return;

  }
}