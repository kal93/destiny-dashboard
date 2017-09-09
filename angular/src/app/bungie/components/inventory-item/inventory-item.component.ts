import {
  ApplicationRef, ComponentFactoryResolver, Component, ComponentRef,
  ElementRef, EmbeddedViewRef, EventEmitter, Injector, Input, Output
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IAccountSummary, InventoryItem } from '../../services/interface.barrel';
import { InventoryItemPopupComponent } from './inventory-item-popup/inventory-item-popup.component';
import { DestinyInventoryItemDefinition } from "app/bungie/manifest/interfaces";

import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'dd-inventory-item',
  templateUrl: './inventory-item.component.html',
  styleUrls: ['./inventory-item.component.scss']
})
export class InventoryItemComponent {
  @Input()
  inventoryItem: InventoryItem;
  @Input()
  inventoryItemDefinition: DestinyInventoryItemDefinition;
  @Input()
  accountSummary: IAccountSummary;
  @Input()
  disablePopup: boolean = false;
  @Input()
  size: number = 62;

  // Classes
  @Input()
  edit: boolean = false;
  @Input()
  equipped: boolean = false;
  @Input()
  disabled: boolean = false;
  @Input()
  selected: boolean = false;
  @Input()
  textColor: string;

  @Output()
  longPress = new EventEmitter<void>();
  @Output()
  clicked = new EventEmitter<void>();
  @Output()
  transferItemToIndexEvent = new EventEmitter<{ inventoryItem: InventoryItem, destCharacterIndex: number }>();
  @Output()
  equipItemToIndexEvent = new EventEmitter<{ inventoryItem: InventoryItem, destCharacterIndex: number }>();

  // 0=nothing, 1=kinetic, 2=arc, 3=solar, 4=void
  damageTypeColors = ["#2A333E", "#2A333E", "#84C4EB", "#F36F26", "#B082CB"];

  destroyPopupSubject: Subject<void> = new Subject<void>();
  destroyPopupSubscription: Subscription;

  inventoryItemPopupComponentRef: ComponentRef<InventoryItemPopupComponent>;
  popupVisible: boolean = false;

  constructor(
    public domSanitizer: DomSanitizer,
    private elementRef: ElementRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef,
    private injector: Injector) { }

  ngOnDestroy() {
    if (this.destroyPopupSubscription) {
      this.hidePopup();
      this.destroyPopupSubscription.unsubscribe();
    }
  }

  click() {
    console.log(this.inventoryItem);
    console.log(this.inventoryItemDefinition);

    this.clicked.emit();

    if (!this.disablePopup)
      this.showPopup();
  }

  showPopup() {
    if (this.popupVisible) {
      this.hidePopup();
      return;
    }
    // Create a component reference from the component 
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(InventoryItemPopupComponent);
    this.inventoryItemPopupComponentRef = componentFactory.create(this.injector);

    // Send inputs to the component. Let the component know which element should show the tooltip.
    this.inventoryItemPopupComponentRef.instance["targetElementRef"] = this.elementRef;
    this.inventoryItemPopupComponentRef.instance["inventoryItem"] = this.inventoryItem;
    this.inventoryItemPopupComponentRef.instance["inventoryItemDefinition"] = this.inventoryItemDefinition;
    this.inventoryItemPopupComponentRef.instance["destroyPopupSubject"] = this.destroyPopupSubject;
    this.inventoryItemPopupComponentRef.instance["accountSummary"] = this.accountSummary;
    this.inventoryItemPopupComponentRef.instance["transferItemToIndexEvent"] = this.transferItemToIndexEvent;
    this.inventoryItemPopupComponentRef.instance["equipItemToIndexEvent"] = this.equipItemToIndexEvent;

    this.destroyPopupSubscription = this.destroyPopupSubject.subscribe(() => {
      this.hidePopup();
    });

    // Attach component to the appRef so that it's inside the ng component tree
    this.applicationRef.attachView(this.inventoryItemPopupComponentRef.hostView);
    this.popupVisible = true;

    // Get DOM element from component
    let domElem: HTMLElement = (this.inventoryItemPopupComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0];

    // Append DOM element to the body
    document.body.appendChild(domElem);
  }

  hidePopup() {
    this.applicationRef.detachView(this.inventoryItemPopupComponentRef.hostView);
    this.popupVisible = false;
    this.inventoryItemPopupComponentRef.destroy();
  }
}