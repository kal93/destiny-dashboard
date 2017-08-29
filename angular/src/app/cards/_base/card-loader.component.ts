import { Component, Input } from '@angular/core';

import { ICard } from './card.interface';

//"Dynamic component loader"
@Component({
  selector: 'dd-card-loader',
  template: `<dd-countdown *ngIf="dashboardCard.definitionId == 0" [dashboardCard]="dashboardCard"></dd-countdown>
             <dd-stats *ngIf="dashboardCard.definitionId == 1" [dashboardCard]="dashboardCard"></dd-stats>
             <dd-reddit *ngIf="dashboardCard.definitionId == 2" [dashboardCard]="dashboardCard"></dd-reddit>
             <dd-reputation *ngIf="dashboardCard.definitionId == 3" [dashboardCard]="dashboardCard"></dd-reputation>
             <dd-twitch *ngIf="dashboardCard.definitionId == 4" [dashboardCard]="dashboardCard"></dd-twitch>
             <dd-bungie-news *ngIf="dashboardCard.definitionId == 5" [dashboardCard]="dashboardCard"></dd-bungie-news>
             <dd-inventory *ngIf="dashboardCard.definitionId == 6" [dashboardCard]="dashboardCard"></dd-inventory>
             <dd-clan-leaderboards *ngIf="dashboardCard.definitionId == 7" [dashboardCard]="dashboardCard"></dd-clan-leaderboards>
             <dd-dashboard-news *ngIf="dashboardCard.definitionId == 8" [dashboardCard]="dashboardCard"></dd-dashboard-news>`

})

export class CardLoaderComponent {
  @Input() dashboardCard: ICard;
}
