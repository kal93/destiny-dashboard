import { Component, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SharedApp } from '../../../shared/services/shared-app.service';
import { ICard } from '../card.interface';

@Component({
  selector: 'dd-card-header',
  templateUrl: './card-header.component.html',
  styleUrls: ['./card-header.component.scss']
})
export class CardHeaderComponent {
  @Input() dashboardCard: ICard;

  constructor(public router: Router, public sharedApp: SharedApp) { }

  ngOnInit() { }
}
