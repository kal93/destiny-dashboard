import { Component } from '@angular/core';
import { MdSlideToggleChange } from '@angular/material';
import { SharedApp } from '../shared/services/shared-app.service';

@Component({
  selector: 'dd-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  constructor(public sharedApp: SharedApp) {
    this.sharedApp.updateMetaTags("Settings", "DestinyDashboard Settings");
  }

  ngOnInit() {
  }

  setNightMode(index: number, toggleEvent: MdSlideToggleChange) {
    this.sharedApp.nightMode = toggleEvent.checked;
    this.sharedApp.setLocalStorage("nightMode", this.sharedApp.nightMode);
  }

}
