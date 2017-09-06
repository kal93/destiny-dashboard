import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MdPaginator } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { DataSource } from '@angular/cdk/collections';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';

import { DestinyInventoryItemDefinition } from "app/bungie/manifest/interfaces";

import { DestinyMembership, IAccountSummary, ProgressionBase } from 'app/bungie/services/interface.barrel';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
  selector: 'dd-database',
  templateUrl: './database.component.html',
  styleUrls: ['../_base/card.component.scss', './database.component.scss']
})
export class DatabaseComponent extends CardComponent {
  @ViewChild(MdPaginator) paginator: MdPaginator;

  CARD_DEFINITION_ID = 9;

  manifestInventory = new Array<DestinyInventoryItemDefinition>();

  // Filtering
  searchText: string = "";
  searchTextForm = new FormControl();
  itemTypes: Array<any> = [{ value: "Quest", displayValue: "Quest" }, { value: "primary", displayValue: "Primary Weapons" }];

  // Data table
  displayedColumns = ['icon', 'name', 'type'];
  dataSource: ItemDefinitionDataSource;

  // Paginator
  PAGE_SIZE: number = 15;

  constructor(public domSanitizer: DomSanitizer, private manifestService: ManifestService, public sharedApp: SharedApp) {
    super(sharedApp);

    var manifestInventoryMap: Map<number, DestinyInventoryItemDefinition> = this.manifestService.getTableMap("DestinyInventoryItemDefinition");
    manifestInventoryMap.forEach((itemDefinition, itemHash) => {
      itemDefinition.displayProperties.nameLower = itemDefinition.displayProperties.name.toLowerCase();
      this.manifestInventory.push(itemDefinition);
    });
  }

  ngOnInit() {
    super.ngOnInit();

    this.dataSource = new ItemDefinitionDataSource(this.paginator, this.manifestInventory);

    this.searchTextForm.valueChanges.debounceTime(200).distinctUntilChanged().subscribe((newSearchText) => {
      this.searchText = newSearchText;
      this.dataSource.filterChange.next({ searchText: this.searchText.toLowerCase(), itemType: "", pageChange: false });
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  paginatorChanged() {
    this.dataSource.filterChange.next({ searchText: this.searchText.toLowerCase(), itemType: "", pageChange: true });
  }

  iconClicked(itemDef: any) {
    console.log(itemDef);
  }
}

interface Filter {
  searchText: string,
  itemType: string,
  pageChange: boolean
}

export class ItemDefinitionDataSource extends DataSource<any> {
  filterChange = new BehaviorSubject<Filter>({ searchText: "", itemType: "", pageChange: false });
  filteredInventoryItems = new Array<DestinyInventoryItemDefinition>();

  constructor(private paginator: MdPaginator, private inventoryItems: Array<DestinyInventoryItemDefinition>) {
    super();
  }

  connect(): Observable<DestinyInventoryItemDefinition[]> {
    return this.filterChange.map(() => {
      let filter = this.filterChange.value;

      // Don't recalculate inventory item filter if we're only changing page size
      if (!filter.pageChange) {
        this.filteredInventoryItems = this.inventoryItems.filter((item: DestinyInventoryItemDefinition) => {

          // Filter on search text
          if (item.displayProperties.nameLower.indexOf(filter.searchText) != -1)
            return true;
          if (item.itemTypeAndTierDisplayName.toLowerCase().indexOf(filter.searchText) != -1)
            return true;

          return false;
        });
      }

      let startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      return this.filteredInventoryItems.slice(startIndex, startIndex + this.paginator.pageSize);
    });
  }

  disconnect() { }
}
