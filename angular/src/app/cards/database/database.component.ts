import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';

import { DestinyInventoryItemDefinition } from "app/bungie/manifest/interfaces";

import { DestinyMembership, IAccountSummary, Progression, SummaryCharacter } from 'app/bungie/services/interface.barrel';

@Component({
  selector: 'dd-database',
  templateUrl: './database.component.html',
  styleUrls: ['../_base/card.component.scss', './database.component.scss']
})
export class DatabaseComponent extends CardComponent {
  CARD_DEFINITION_ID = 9;

  manifestInventoryMap: Map<number, DestinyInventoryItemDefinition>;
  manifestInventoryArray = new Array<DestinyInventoryItemDefinition>();

  itemCategories: Array<any> = [{ value: "all", displayValue: "All" }, { value: "primary", displayValue: "Primary Weapons" }];

  // Filtering
  searchText: string = '';
  searchTextForm = new FormControl();

  MAX_ITEMS = 100;

  constructor(public domSanitizer: DomSanitizer, private manifestService: ManifestService, public sharedApp: SharedApp) {
    super(sharedApp);

    // Establish maps
    this.manifestInventoryMap = this.manifestService.getTableMap("DestinyInventoryItemDefinition");
    this.manifestInventoryMap.forEach((itemDefinition, itemHash) => {
      this.manifestInventoryArray.push(itemDefinition);
    });
  }

  ngOnInit() {
    super.ngOnInit();

  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  initSearch() {
    this.searchTextForm.valueChanges.debounceTime(400).subscribe((newSearchText) => {
      this.searchText = newSearchText;

      let charAddedToEnd: boolean = false;
      if (newSearchText.length - 1 == this.searchText.length && newSearchText.startsWith(this.searchText))
        charAddedToEnd = true;

      this.searchText = newSearchText;
      this.applyFilter(charAddedToEnd);
    });
  }


  applyFilter(skipAlreadyFiltered: boolean = false) {
  }

}
