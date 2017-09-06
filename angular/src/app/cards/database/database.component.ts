import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { DataSource } from '@angular/cdk/collections';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';

import { DestinyInventoryItemDefinition } from "app/bungie/manifest/interfaces";

import { DestinyMembership, IAccountSummary, ProgressionBase } from 'app/bungie/services/interface.barrel';


import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';

@Component({
  selector: 'dd-database',
  templateUrl: './database.component.html',
  styleUrls: ['../_base/card.component.scss', './database.component.scss']
})
export class DatabaseComponent extends CardComponent {
  CARD_DEFINITION_ID = 9;

  manifestInventoryArray = new Array<DestinyInventoryItemDefinition>();

  // Filtering
  searchTextForm = new FormControl();
  itemCategories: Array<any> = [{ value: "all", displayValue: "All" }, { value: "primary", displayValue: "Primary Weapons" }];

  // Data table
  displayedColumns = ['name'];
  dataSource: ItemDefinitionDataSource;

  constructor(public domSanitizer: DomSanitizer, private manifestService: ManifestService, public sharedApp: SharedApp) {
    super(sharedApp);

    var manifestInventoryMap: Map<number, DestinyInventoryItemDefinition> = this.manifestService.getTableMap("DestinyInventoryItemDefinition");
    manifestInventoryMap.forEach((itemDefinition, itemHash) => {
      itemDefinition.displayProperties.nameLower = itemDefinition.displayProperties.name.toLowerCase();
      this.manifestInventoryArray.push(itemDefinition);
    });

    this.dataSource = new ItemDefinitionDataSource(this.manifestInventoryArray);
  }

  ngOnInit() {
    super.ngOnInit();
    this.initSearch();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  initSearch() {
    this.searchTextForm.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((newSearchText) => {
      this.dataSource.filter = newSearchText.toLowerCase();
    });
  }
}

export class ItemDefinitionDataSource extends DataSource<any> {
  _filterChange = new BehaviorSubject('');
  get filter(): string { return this._filterChange.value; }
  set filter(filter: string) { this._filterChange.next(filter); }

  inventoryItems: Array<DestinyInventoryItemDefinition>;
  constructor(inventoryItems: Array<DestinyInventoryItemDefinition>) {
    super();
    this.inventoryItems = inventoryItems;
  }

  connect(): Observable<DestinyInventoryItemDefinition[]> {
    return this._filterChange.map(() => {
      return this.inventoryItems.slice().filter((item: DestinyInventoryItemDefinition) => {
        if (item.displayProperties.nameLower.indexOf(this.filter.toLowerCase()) == -1)
          return false;
        return true;
      });
    });
  }

  disconnect() { }
}
