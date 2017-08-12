import { Input } from '@angular/core';
import { MdProgressSpinner } from '@angular/material';
import { SharedApp } from 'app/shared/services/shared-app.service';

import { ICard } from './card.interface';

export class CardComponent {
  //Should be populated at constructor time in every child
  CARD_DEFINITION_ID: number;

  //If null, the card is loaded in fullscreen mode
  @Input() dashboardCard: ICard;

  //Allows cards to easily set local storage for themselves
  localStorageId: string;

  public isFullscreen: boolean = false;

  constructor(public sharedApp: SharedApp) {
  }

  ngOnInit() {
    this.localStorageId = "card" + this.CARD_DEFINITION_ID + "-";
    this.isFullscreen = this.dashboardCard == null;
  }

  ngOnDestroy() {
  }

  setCardLocalStorage(key: string, value: any) {
    this.sharedApp.setLocalStorage(this.localStorageId + key, value);
  }

  getCardLocalStorage(key: string, defaultValue?: any): string {
    return this.sharedApp.getLocalStorage(this.localStorageId + key, defaultValue);
  }

  getCardLocalStorageAsJsonObject(key: string, defaultValue?: any) {
    return this.sharedApp.getLocalStorageAsJsonObject(this.localStorageId + key, defaultValue);
  }
}