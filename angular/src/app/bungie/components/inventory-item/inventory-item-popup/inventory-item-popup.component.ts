import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { scaleIn } from '../../../../shared/animations';
import { SharedApp } from 'app/shared/services/shared-app.service'
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { InventoryUtils } from 'app/bungie/services/service.barrel';

import { IAccountSummary, InventoryItem } from '../../../services/interface.barrel';
import { DestinyInventoryItemDefinition } from 'app/bungie/manifest/interfaces/';

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
  inventoryItemDefinition: DestinyInventoryItemDefinition;
  @Input()
  targetElementRef: ElementRef;
  @Input()
  accountSummary: IAccountSummary;

  @Output()
  transferItemToIndexEvent = new EventEmitter<{ inventoryItem: InventoryItem, destCharacterIndex: number }>();
  @Output()
  equipItemToIndexEvent = new EventEmitter<{ inventoryItem: InventoryItem, destCharacterIndex: number }>();
  @Output()
  destroyPopupSubject: Subject<void> = new Subject<void>();

  public popupStyle = {};

  damageTypeColors = ["#2A333E", "#2A333E", "#84C4EB", "#F36F26", "#B082CB"];

  InventoryUtils = InventoryUtils;

  constructor(public domSanitizer: DomSanitizer, private elementRef: ElementRef, public manifestService: ManifestService, private sharedApp: SharedApp) {
  }


  @HostListener('document:touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.destroyIfClicked(event.touches[0].target);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    let eventTarget: any = event.target;
    this.destroyIfClicked(event.target);
  }

  destroyIfClicked(target: EventTarget) {
    // Make sure we're skipping events if the user clicks within the popup, or the icon
    if (!this.elementRef.nativeElement.contains(target) && !this.targetElementRef.nativeElement.contains(target))
      this.destroyPopupSubject.next();
  }

  ngOnInit() {
    this.initPopupPosition();
  }

  initPopupPosition() {
    let popupWidth = 280;
    let popupMaxHeight = 300;
    let boundaryPadding = 35;
    // Get the position and dimensions of the element we're trying to show the tooltip for
    let boundingRect: ClientRect = this.targetElementRef.nativeElement.getBoundingClientRect();

    let popupTop: number = boundingRect.top + boundingRect.height;
    let popupLeft: number = boundingRect.left;

    // Test to see if popup will be too far right (off screen)
    if (popupLeft + popupWidth + boundaryPadding > this.sharedApp.windowWidth)
      popupLeft = this.sharedApp.windowWidth - popupWidth - boundaryPadding;

    // Test to see if popup will be too far down 
    if (popupTop + popupMaxHeight + boundaryPadding > this.sharedApp.windowHeight)
      popupTop = this.sharedApp.windowHeight - popupMaxHeight - boundaryPadding;

    // Apply styles to popup
    this.popupStyle = { 'top.px': popupTop, 'left.px': popupLeft, 'width.px': popupWidth, 'max-height.px': popupMaxHeight };
  }

  transferToIndex(destCharacterIndex: number) {
    this.transferItemToIndexEvent.emit({ inventoryItem: this.inventoryItem, destCharacterIndex: destCharacterIndex });
    this.destroyPopupSubject.next();
  }

  equipToIndex(destCharacterIndex: number) {
    if (this.inventoryItem.characterIndex == destCharacterIndex && InventoryUtils.isItemEquipped(this.inventoryItem))
      return;

    this.equipItemToIndexEvent.emit({ inventoryItem: this.inventoryItem, destCharacterIndex: destCharacterIndex });
    this.destroyPopupSubject.next();
  }
}