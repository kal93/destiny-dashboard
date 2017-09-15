import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { DestinyLoreDefinition } from 'app/bungie/manifest/interfaces';

@Component({
  selector: 'dd-lore',
  templateUrl: './lore.component.html',
  styleUrls: ['../_base/card.component.scss', './lore.component.scss'],
})
export class LoreComponent extends CardComponent {
  CARD_DEFINITION_ID = 11;

  loreDefinitions = new Array<DestinyLoreDefinition>();
  loreDefinitionFiltered = new Array<DestinyLoreDefinition>();

  searchText: string = "";
  searchTextForm = new FormControl();


  constructor(public domSanitizer: DomSanitizer, private manifestService: ManifestService, public sharedApp: SharedApp) {
    super(sharedApp);
  }

  ngOnInit() {
    super.ngOnInit();

    let namesMap = new Map<string, boolean>();

    let loreMap = this.manifestService.getTableMap("DestinyLoreDefinition");
    loreMap.forEach((loreDefinition: DestinyLoreDefinition, index: number) => {
      let loreName = loreDefinition.displayProperties.name;
      if (!namesMap.has(loreName) && loreName != null && loreName.length > 0) {
        if (loreDefinition.displayProperties != null) {
          if (loreDefinition.displayProperties.description == null || loreDefinition.displayProperties.description.length == 0)
            loreDefinition.displayProperties.description = "No description.";
          else
            loreDefinition.displayProperties.description = loreDefinition.displayProperties.description.split("\n").join("<br/>");

          this.loreDefinitions.push(loreDefinition);
          namesMap.set(loreName, true);
        }
      }
    });

    this.applyFilter();

    this.searchTextForm.valueChanges.debounceTime(200).distinctUntilChanged().subscribe((newSearchText) => {
      this.searchText = newSearchText;
      this.applyFilter();
    });

  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  applyFilter() {
    this.loreDefinitionFiltered = new Array<DestinyLoreDefinition>();
    let searchTextLower = this.searchText.toLowerCase();
    this.loreDefinitions.forEach((loreDefinition) => {
      let name = loreDefinition.displayProperties.name;
      let description = loreDefinition.displayProperties.description;
      let subtitle = loreDefinition.subtitle;
      if (name == null || name.length == 0) name = "";
      if (description == null || description.length == 0) description = "";
      if (subtitle == null || subtitle.length == 0) subtitle = "";

      if (name.toLowerCase().indexOf(searchTextLower) != -1 || description.toLowerCase().indexOf(searchTextLower) != -1 || subtitle.toLowerCase().indexOf(searchTextLower) != -1) {
        this.loreDefinitionFiltered.push(loreDefinition);
      }
    });
  }
}
