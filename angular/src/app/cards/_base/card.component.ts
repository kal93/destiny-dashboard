import { Input } from '@angular/core';
import { MdProgressSpinner } from '@angular/material';
import { SharedApp } from '../../shared/services/shared-app.service';

import { ICard } from './card.interface';

export class CardComponent {
  //Should be populated at constructor time in every child
  CARD_ID: number;

  //Allows cards to easily set local storage for themselves
  localStorageId: string;

  //If null, the card is loaded in fullscreen mode
  @Input() dashboardCard: ICard;

  constructor(public sharedApp: SharedApp) {
  }

  ngOnInit() {
    this.localStorageId = "card" + this.CARD_ID + "-";
  }

  ngOnDestroy() {
  }

  setCardLocalStorage(key: string, value: any) {
    this.sharedApp.setLocalStorage(this.localStorageId + key, value);
  }

  getCardLocalStorage(key: string, defaultValue?: any): string {
    return this.sharedApp.getLocalStorage(this.localStorageId + key, defaultValue);
  }
}