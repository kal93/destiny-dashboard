import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { InventoryItem } from '../../../services/interface.barrel';
import { scaleIn } from '../../../../shared/animations';

import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'dd-inventory-item-popup',
  templateUrl: './inventory-item-popup.component.html',
  styleUrls: ['./inventory-item-popup.component.scss'],
  animations: [scaleIn()]
})
export class InventoryItemPopupComponent {
  @Input()
  inventoryItem: InventoryItem;
  @Input()
  targetElementRef: ElementRef;

  @Output()
  destroyPopupSubject: Subject<void> = new Subject<void>();

  private isInitialized: boolean = false;
  public popupStyle = {};

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    let eventTarget: any = event.target;
    if (this.isInitialized && !this.elementRef.nativeElement.contains(event.target))
      this.destroyPopupSubject.next();
  }

  ngOnInit() {
    console.log(this.inventoryItem);

    // Get the position and dimensions of the element we're trying to show the tooltip for
    let boundingRect: ClientRect = this.targetElementRef.nativeElement.getBoundingClientRect();

    // Set modifiers based on desired position
    let topModifier: number = boundingRect.height;
    let leftModifier: number = boundingRect.width;

    // Apply modifiers to tooltip position 
    this.popupStyle = { 'top.px': boundingRect.top + topModifier, 'left.px': boundingRect.left + leftModifier };

    setTimeout(() => {
      this.isInitialized = true;
    }, 200);

  }

}