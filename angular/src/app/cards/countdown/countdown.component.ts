import { Component } from '@angular/core';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from '../../shared/services/shared-app.service';

@Component({
  selector: 'dd-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['../_base/card.component.scss', './countdown.component.scss'],
})
export class CountdownComponent extends CardComponent {
  CARD_ID = 0;

  countdownIntervalId;
  countdownValue: string;

  // Set the date we're counting down to
  countDownDate = new Date("Sept 5, 2017 04:00:00").getTime();

  constructor(public sharedApp: SharedApp) {
    super(sharedApp);
  }

  ngOnInit() {
    super.ngOnInit();

    this.calculateCountdown();
    this.countdownIntervalId = setInterval(() => {
      this.calculateCountdown();
    }, 1000);
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    clearInterval(this.countdownIntervalId);
  }

  calculateCountdown() {
    var now = new Date().getTime();

    var distance = this.countDownDate - now;

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    this.countdownValue = days + "d " + hours + "h " + minutes + "m " + seconds + "s";
  }

}
