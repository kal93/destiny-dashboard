import { Component } from '@angular/core';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from 'app/shared/services/shared-app.service';

@Component({
  selector: 'dd-my-new-card',
  templateUrl: './my-new-card.component.html',
  styleUrls: ['../_base/card.component.scss', './my-new-card.component.scss'],
})

export class MyNewCardComponent extends CardComponent {
  
  // Use a real card index number that you can get from the angular/src/app/cards/_base/card-definition.ts file
  CARD_DEFINITION_ID = 9000;
  
  // This is just a skeleton so you will need to build this out.  Remove these comments from a real card.

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

