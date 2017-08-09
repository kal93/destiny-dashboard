import { Component} from '@angular/core';
import {CardComponent} from '../_base/card.component';
import {SharedApp} from "app/shared/services/shared-app.service";
import {AccountGrimoireService} from "app/bungie/services/destiny/account-grimoire.service";

@Component({
  selector: 'dd-grimoire',
  templateUrl: './grimoire.component.html',
  styleUrls: ['./grimoire.component.scss']
})
export class GrimoireComponent extends CardComponent {

  constructor(public sharedApp: SharedApp, private grimoireService: AccountGrimoireService) {
    super(sharedApp);
  }

}
