import { Component, Input } from '@angular/core';

import { ICard } from './card.interface';

//"Dynamic component loader"
@Component({
  selector: 'dd-card-loader',
  template: `<dd-countdown *ngIf="dashboardCard.id == 0" [dashboardCard]="dashboardCard"></dd-countdown>
             <dd-stats *ngIf="dashboardCard.id == 1" [dashboardCard]="dashboardCard"></dd-stats>
             <dd-reddit *ngIf="dashboardCard.id == 2" [dashboardCard]="dashboardCard"></dd-reddit>
             <dd-public-events *ngIf="dashboardCard.id == 3" [dashboardCard]="dashboardCard"></dd-public-events>
             <dd-twitch *ngIf="dashboardCard.id == 4" [dashboardCard]="dashboardCard"></dd-twitch>`
})

export class CardLoaderComponent {
  @Input() dashboardCard: ICard;
}
