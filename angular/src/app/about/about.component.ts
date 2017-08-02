import { Component, OnInit, VERSION } from '@angular/core';
import { SharedApp } from '../shared/services/shared-app.service';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  environment = environment;
  angularVersion = VERSION;

  public cacheSizeKB: string;

  constructor(public sharedApp: SharedApp) { }

  ngOnInit() {

    var total = 0, keySize, key;
    for (key in localStorage) {
      keySize = ((localStorage[key].length + key.length) * 2);
      total += keySize;
      //console.log(key.substr(0, 50) + " = " + (keySize / 1024).toFixed(2) + " KB")
    };
    this.cacheSizeKB = (total / 1024).toFixed(2);
  }

}
