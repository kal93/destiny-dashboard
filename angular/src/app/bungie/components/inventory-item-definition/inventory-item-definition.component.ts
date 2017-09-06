import {
  ApplicationRef, ComponentFactoryResolver, Component, ComponentRef,
  ElementRef, EmbeddedViewRef, EventEmitter, Injector, Input, Output
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IAccountSummary, InventoryItem } from '../../services/interface.barrel';
import { InventoryItemDefinitionPopupComponent } from './inventory-item-definition-popup/inventory-item-definition-popup.component';
import { DestinyInventoryItemDefinition } from "app/bungie/manifest/interfaces";

import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'dd-inventory-item-definition',
  templateUrl: './inventory-item-definition.component.html',
  styleUrls: ['./inventory-item-definition.component.scss']
})
export class InventoryItemDefinitionComponent {
  @Input()
  inventoryItemDefinition: DestinyInventoryItemDefinition;
  @Input()
  disablePopup: boolean = false;
  @Input()
  textColor: string;

  @Output()
  clicked = new EventEmitter<void>();

  // 0=nothing, 1=kinetic, 2=arc, 3=solar, 4=void
  damageTypeColors = ["#2A333E", "#2A333E", "#84C4EB", "#F36F26", "#B082CB"];

  destroyPopupSubject: Subject<void> = new Subject<void>();
  destroyPopupSubscription: Subscription;

  inventoryItemDefinitionPopupComponentRef: ComponentRef<InventoryItemDefinitionPopupComponent>;
  popupVisible: boolean = false;

  constructor(
    public domSanitizer: DomSanitizer,
    private elementRef: ElementRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef,
    private injector: Injector) { }

  ngOnDestroy() {
    if (this.destroyPopupSubscription)
      this.destroyPopupSubscription.unsubscribe();
  }

  click() {
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
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(InventoryItemDefinitionPopupComponent);
    this.inventoryItemDefinitionPopupComponentRef = componentFactory.create(this.injector);

    // Send inputs to the component. Let the component know which element should show the tooltip.
    this.inventoryItemDefinitionPopupComponentRef.instance["targetElementRef"] = this.elementRef;
    this.inventoryItemDefinitionPopupComponentRef.instance["inventoryItemDefinition"] = this.inventoryItemDefinition;
    this.inventoryItemDefinitionPopupComponentRef.instance["destroyPopupSubject"] = this.destroyPopupSubject;
    this.destroyPopupSubscription = this.destroyPopupSubject.subscribe(() => {
      this.hidePopup();
    });

    // Attach component to the appRef so that it's inside the ng component tree
    this.applicationRef.attachView(this.inventoryItemDefinitionPopupComponentRef.hostView);
    this.popupVisible = true;

    // Get DOM element from component
    let domElem: HTMLElement = (this.inventoryItemDefinitionPopupComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0];

    // Append DOM element to the body
    document.body.appendChild(domElem);
  }

  hidePopup() {
    this.applicationRef.detachView(this.inventoryItemDefinitionPopupComponentRef.hostView);
    this.popupVisible = false;
    this.inventoryItemDefinitionPopupComponentRef.destroy();
  }
}