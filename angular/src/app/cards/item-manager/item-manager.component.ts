import { Component, ViewChild } from '@angular/core';
import { MdTabGroup } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { SharedBungie } from '../../bungie/shared-bungie.service';
import { SharedApp } from '../../shared/services/shared-app.service';
import { ManifestService } from '../../bungie/manifest/manifest.service';

import { AccountSummaryService, CharacterInventoryService, VaultSummaryService } from '../../bungie/services/service.barrel';
import { CharacterInventoryItem, DestinyMembership, IAccountSummary, ICharacterInventory, IVaultSummary, SummaryCharacter, VaultItem } from '../../bungie/services/interface.barrel';

import { fadeIn } from '../../shared/animations';

@Component({
  selector: 'dd-item-manager',
  templateUrl: './item-manager.component.html',
  styleUrls: ['../_base/card.component.scss', './item-manager.component.scss'],
  animations: [fadeIn()]
})
export class ItemManagerComponent extends CardComponent {
  CARD_DEFINITION_ID = 6;

  @ViewChild("tabGroup")
  tabGroup: MdTabGroup;

  selectedTabIndex: number = 0;
  accountSummary: IAccountSummary;
  selectedMembership: DestinyMembership;

  vaultBuckets: Map<string, Array<VaultItem>>;

  constructor(private accountSummaryService: AccountSummaryService, private characterInventoryService: CharacterInventoryService,
    public domSanitizer: DomSanitizer, private manifestService: ManifestService, private sharedBungie: SharedBungie, public sharedApp: SharedApp,
    private vaultSummaryService: VaultSummaryService) {
    super(sharedApp);
  }

  ngOnInit() {
    super.ngOnInit();

    // Load previously selected tab index
    this.selectedTabIndex = +this.getCardLocalStorage("selectedTabIndex", 0);

    // Set our membership
    this.selectedMembership = this.sharedBungie.destinyMemberships[this.sharedApp.userPreferences.membershipIndex];

    // Fetch the inventory
    this.getInventory().then(() => {
      this.tabGroup.selectedIndex = this.selectedTabIndex;
      this.selectedTabIndexChanged(this.selectedTabIndex);
    }).catch((error) => {
      this.sharedApp.showError("There was an error fetching the inventory.", error);
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  getInventory(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get Account Summary to get the list of available characters
      this.accountSummaryService.getAccountSummary(this.selectedMembership).then((accountSummary: IAccountSummary) => {
        this.accountSummary = accountSummary;

        // Set an array of promises so we can use Promise.All later
        var inventoryDataPromises = new Array<Promise<any>>();

        // Add the vault request to the promises we're about to fire 
        inventoryDataPromises.push(this.vaultSummaryService.getVaultSummary(this.selectedMembership));

        // Now add character promises
        this.accountSummary.characters.forEach((character: SummaryCharacter) => {
          inventoryDataPromises.push(this.characterInventoryService.getCharacterInventory(this.selectedMembership, character.characterBase.characterId));

          // Set the manifest values for the characters
          character.characterBase.classHashValue = this.manifestService.getManifestEntry("DestinyClassDefinition", character.characterBase.classHash);
          character.characterBase.genderHashValue = this.manifestService.getManifestEntry("DestinyGenderDefinition", character.characterBase.genderHash);
          character.characterBase.raceHashValue = this.manifestService.getManifestEntry("DestinyRaceDefinition", character.characterBase.raceHash);
        });

        Promise.all(inventoryDataPromises).then((responses) => {
          // Vault is always the first response, so let's take that first
          var vaultSummaryResponse: IVaultSummary = responses.shift();
          this.populateVaultBuckets(vaultSummaryResponse.items);

          // All remaining responses should be characters
          for (var i = 0; i < this.accountSummary.characters.length; i++) {
            var character = this.accountSummary.characters[i];
            var characterInventoryResponse = responses[i];
          }

          resolve();
        }).catch((error) => {
          reject(error);
        });

      }).catch(error => {
        this.sharedApp.showError("There was a problem getting the account summary.", error);
        reject(error);
      });
    });
  }

  populateVaultBuckets(vaultItems: Array<VaultItem>) {
    // Reset vault buckets
    this.vaultBuckets = new Map<string, Array<VaultItem>>();

    // Loop each vault item and place in to proper bucket
    vaultItems.forEach((vaultItem) => {

    });

    //Sort each bucket alphabetically
  }

  initInventoryItem(inventoryItem: VaultItem) {

  }


  selectedTabIndexChanged(targetCharacterIndex: number) {
    // Set new character tab index
    this.selectedTabIndex = targetCharacterIndex;

    // Save the selected tab index
    this.setCardLocalStorage("selectedTabIndex", this.selectedTabIndex);
  }

}
