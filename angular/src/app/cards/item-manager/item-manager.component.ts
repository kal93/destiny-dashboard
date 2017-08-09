import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MdTabGroup } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { SharedBungie } from '../../bungie/shared-bungie.service';
import { SharedApp } from '../../shared/services/shared-app.service';
import { ManifestService } from '../../bungie/manifest/manifest.service';

import { AccountSummaryService, CharacterInventoryService, VaultSummaryService } from 'app/bungie/services/service.barrel';
import { Bucket, CharacterInventoryItem, DestinyMembership, IAccountSummary, ICharacterInventory, IVaultSummary, SummaryCharacter, VaultItem } from 'app/bungie/services/interface.barrel';

import { fadeIn } from '../../shared/animations';

@Component({
  selector: 'dd-item-manager',
  templateUrl: './item-manager.component.html',
  styleUrls: ['../_base/card.component.scss', './item-manager.component.scss'],
  animations: [fadeIn()],
  //changeDetection: ChangeDetectionStrategy.OnPush
})

export class ItemManagerComponent extends CardComponent {
  CARD_DEFINITION_ID = 6;

  selectedTabIndex: number = 0;
  accountSummary: IAccountSummary;
  selectedMembership: DestinyMembership;

  vaultBucketsMap: Map<number, Bucket>;
  vaultBuckets: Array<Bucket>;

  constructor(private accountSummaryService: AccountSummaryService, private changeDetectorRef: ChangeDetectorRef, private characterInventoryService: CharacterInventoryService,
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
      this.selectedTabIndexChanged(this.selectedTabIndex);
      //this.changeDetectorRef.detectChanges();
    }).catch((error) => {
      this.sharedApp.showError("There was an error fetching the inventory.", error);
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  selectedTabIndexChanged(targetCharacterIndex: number) {
    this.selectedTabIndex = targetCharacterIndex;
    this.setCardLocalStorage("selectedTabIndex", this.selectedTabIndex);
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
          character.characterBase.classValue = this.manifestService.getManifestEntry("DestinyClassDefinition", character.characterBase.classHash);
          character.characterBase.genderValue = this.manifestService.getManifestEntry("DestinyGenderDefinition", character.characterBase.genderHash);
          character.characterBase.raceValue = this.manifestService.getManifestEntry("DestinyRaceDefinition", character.characterBase.raceHash);
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

  populateVaultBuckets(vaultItemsResponse: Array<VaultItem>) {
    //Create a map so we can quickly place vault items in to their proper buckets
    this.vaultBucketsMap = new Map<number, Bucket>();

    // Loop each vault item and place in to proper bucket
    vaultItemsResponse.forEach((vaultItem) => {

      var bucket: Bucket = this.vaultBucketsMap.get(vaultItem.bucketHash);

      // If the bucket for this vault item doesn't exist yet, create it
      if (bucket == null) {
        bucket = {
          hash: vaultItem.bucketHash,
          bucketValue: this.manifestService.getManifestEntry("DestinyInventoryBucketDefinition", vaultItem.bucketHash),
          items: new Array<VaultItem>()
        }
        this.vaultBucketsMap.set(vaultItem.bucketHash, bucket);
      }

      // Get the vault item definition 
      vaultItem.itemValue = this.manifestService.getManifestEntry("DestinyInventoryItemDefinition", vaultItem.itemHash);

      // Get the damage type definition, if exists
      if (vaultItem.damageTypeHash != 0)
        vaultItem.damageTypeValue = this.manifestService.getManifestEntry("DestinyDamageTypeDefinition", vaultItem.damageTypeHash);

      bucket.items.push(vaultItem);
    });

    this.flattenBuckets();
  }

  flattenBuckets() {
    this.vaultBuckets = new Array<Bucket>();
    this.vaultBucketsMap.forEach((bucket, bucketHash) => {
      // Sort vault bucket items alphabetically
      //bucket.items.sort((a, b) => {
      //  return a.itemValue.itemId < b.itemValue.itemId ? -1 : 1;
      //});

      // Add it to the flattened array
      this.vaultBuckets.push(bucket);
    });

    // Sort buckets
    this.vaultBuckets.sort((a, b) => {
      return a.bucketValue.bucketOrder - b.bucketValue.bucketOrder;
    });

    console.log(this.vaultBuckets);
  }

  initInventoryItem(inventoryItem: VaultItem) {

  }

}
