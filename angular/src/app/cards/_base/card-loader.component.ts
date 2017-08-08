import { Component, Input } from '@angular/core';

import { ICard } from './card.interface';

//"Dynamic component loader"
@Component({
  selector: 'dd-card-loader',
  template: `<dd-countdown *ngIf="dashboardCard.definitionId == 0" [dashboardCard]="dashboardCard"></dd-countdown>
             <dd-stats *ngIf="dashboardCard.definitionId == 1" [dashboardCard]="dashboardCard"></dd-stats>
             <dd-reddit *ngIf="dashboardCard.definitionId == 2" [dashboardCard]="dashboardCard"></dd-reddit>
             <dd-public-events *ngIf="dashboardCard.definitionId == 3" [dashboardCard]="dashboardCard"></dd-public-events>
             <dd-twitch *ngIf="dashboardCard.definitionId == 4" [dashboardCard]="dashboardCard"></dd-twitch>
             <dd-bungie-news *ngIf="dashboardCard.definitionId == 5" [dashboardCard]="dashboardCard"></dd-bungie-news>
             <dd-item-manager *ngIf="dashboardCard.definitionId == 6" [dashboardCard]="dashboardCard"></dd-item-manager>`
})

export class CardLoaderComponent {
  @Input() dashboardCard: ICard;
}
