import {
  ApplicationRef, ComponentFactoryResolver, Component, ComponentRef,
  ElementRef, EmbeddedViewRef, EventEmitter, Injector, Input, Output
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { InventoryItem } from '../../services/interface.barrel';
import { InventoryItemPopupComponent } from './inventory-item-popup/inventory-item-popup.component';

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
  equipped: boolean = false;

  @Input()
  selected: boolean = false;

  @Input()
  disablePopup: boolean = true;

  @Input()
  textColor: string;

  @Output()
  longPress = new EventEmitter<void>();

  @Output()
  clicked = new EventEmitter<void>();


  private destroyPopupSubject: Subject<void> = new Subject<void>();
  private destroyPopupSubscription: Subscription;
  // 0=nothing, 1=kinetic, 2=arc, 3=solar, 4=void
  damageTypeColors = ["#2A333E", "#2A333E", "#84C4EB", "#F36F26", "#B082CB"];

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
    this.clicked.emit();

    if (!this.disablePopup)
      this.showPopup();
  }

  showPopup() {
    // Create a component reference from the component 
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(InventoryItemPopupComponent);
    let componentRef: ComponentRef<InventoryItemPopupComponent> = componentFactory.create(this.injector);

    // Send inputs to the component. Let the component know which element should show the tooltip.
    componentRef.instance["targetElementRef"] = this.elementRef;
    componentRef.instance["inventoryItem"] = this.inventoryItem;
    componentRef.instance["destroyPopupSubject"] = this.destroyPopupSubject;

    this.destroyPopupSubscription = this.destroyPopupSubject.subscribe(() => {
      this.applicationRef.detachView(componentRef.hostView);
      componentRef.destroy();
    });

    // Attach component to the appRef so that it's inside the ng component tree
    this.applicationRef.attachView(componentRef.hostView);

    // Get DOM element from component
    let domElem: HTMLElement = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0];

    // Append DOM element to the body
    document.body.appendChild(domElem);
  }
}