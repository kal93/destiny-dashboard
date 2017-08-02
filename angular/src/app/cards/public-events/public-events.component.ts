import { Component } from '@angular/core';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from '../../shared/services/shared-app.service';

@Component({
  selector: 'dd-public-events',
  templateUrl: './public-events.component.html',
  styleUrls: ['../_base/card.component.scss', './public-events.component.scss'],
})
export class PublicEventsComponent extends CardComponent {
  CARD_ID = 3;

  constructor(public sharedApp: SharedApp) {
    super(sharedApp);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
