import { Component } from '@angular/core';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from 'app/shared/services/shared-app.service';

@Component({
  selector: 'dd-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['../_base/card.component.scss', './countdown.component.scss'],
})
export class CountdownComponent extends CardComponent {
  CARD_DEFINITION_ID  = 0;

  countdownIntervalId;
  countdownValue: string;

  // Set the date we're counting down to
  countDownDate = new Date("Sept 6, 2017 00:00:00").getTime();

  constructor(public sharedApp: SharedApp) {
    super(sharedApp);
  }

  ngOnInit() {
    super.ngOnInit();

    this.calculateCountdown();
    this.countdownIntervalId = setInterval(() => {
      this.calculateCountdown();
    }, 60000);
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    clearInterval(this.countdownIntervalId);
  }

  calculateCountdown() {
    let now = new Date().getTime();

    let distance = this.countDownDate - now;

    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    this.countdownValue = days + "d " + hours + "h " + minutes + "m ";
  }

}
