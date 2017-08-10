import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MdTabGroup } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { ItemManagerService } from './item-manager.service';
import { ManifestService } from '../../bungie/manifest/manifest.service';
import { SharedBungie } from '../../bungie/shared-bungie.service';
import { SharedApp } from '../../shared/services/shared-app.service';

import { AccountSummaryService } from 'app/bungie/services/service.barrel';
import { DestinyMembership, InventoryBucket, InventoryItem, IAccountSummary, IVaultSummary, SummaryCharacter } from 'app/bungie/services/interface.barrel';

import { fadeIn } from '../../shared/animations';

@Component({
  selector: 'dd-item-manager',
  templateUrl: './item-manager.component.html',
  styleUrls: ['../_base/card.component.scss', './item-manager.component.scss'],
  animations: [fadeIn()],
  providers: [ItemManagerService]
})

export class ItemManagerComponent extends CardComponent {
  CARD_DEFINITION_ID = 6;

  // Get the selected membership (Xbox, PSN, Blizzard)
  private selectedMembership: DestinyMembership;

  // Account summary so we can get the characters associated to this account
  accountSummary: IAccountSummary;

  // Map of vault bucket data <bucketHash, bucket>
  private vaultBucketsMap: Map<number, InventoryBucket>;

  // Array of vault buckets for display in .html
  vaultBucketsArray: Array<InventoryBucket> = new Array<InventoryBucket>();

  // Array of Map of <bucketHash, bucket>. Array position matches caracter position in this.accountSummary.characters
  private charactersBucketsMap: Array<Map<number, InventoryBucket>>;

  // Array of character buckets for display in .html. Array position matches caracter position in this.accountSummary.characters
  charactersBucketsArray: Array<Array<InventoryBucket>> = new Array<Array<InventoryBucket>>();

  // Tower definition from the manifest so we can have the icon
  towerDefinition: any;

  constructor(private accountSummaryService: AccountSummaryService, private changeDetectorRef: ChangeDetectorRef,
    public domSanitizer: DomSanitizer, private itemManagerService: ItemManagerService, private manifestService: ManifestService, private sharedBungie: SharedBungie, public sharedApp: SharedApp) {
    super(sharedApp);
  }

  ngOnInit() {
    super.ngOnInit();

    // Get tower definition so we can show the tower emblem
    this.towerDefinition = this.manifestService.getManifestEntry("DestinyActivityDefinition", 1522220810);

    // Set our membership (XBL, PSN, Blizzard)
    this.selectedMembership = this.sharedBungie.destinyMemberships[this.sharedApp.userPreferences.membershipIndex];

    // Get Account Summary to get the list of available characters
    this.accountSummaryService.getAccountSummary(this.selectedMembership).then((accountSummary: IAccountSummary) => {
      this.accountSummary = accountSummary;
      this.accountSummary.characters.forEach((character: SummaryCharacter) => {
        // Set the manifest values for the characters
        character.characterBase.classValue = this.manifestService.getManifestEntry("DestinyClassDefinition", character.characterBase.classHash);
        character.characterBase.genderValue = this.manifestService.getManifestEntry("DestinyGenderDefinition", character.characterBase.genderHash);
        character.characterBase.raceValue = this.manifestService.getManifestEntry("DestinyRaceDefinition", character.characterBase.raceHash);
      });

      // Fetch the inventory
      this.itemManagerService.getInventory(this.selectedMembership, this.accountSummary).then((inventoryResponses) => {
        // Vault is the first response
        var vaultSummaryResponse: IVaultSummary = inventoryResponses.shift();

        // Populate vault buckets
        this.vaultBucketsMap = new Map<number, InventoryBucket>();
        this.vaultBucketsArray = new Array<InventoryBucket>();
        this.populateBucketMapFromResponse(vaultSummaryResponse.items, this.vaultBucketsMap);
        this.flattenInventoryBuckets(this.vaultBucketsMap, this.vaultBucketsArray);

        // Init the array for the character buckets map. Should be the same size as the number of characters we have.
        this.charactersBucketsMap = new Array<Map<number, InventoryBucket>>(inventoryResponses.length);

        // All remaining responses should be characters
        for (var i = 0; i < inventoryResponses.length; i++) {
          this.charactersBucketsMap[i] = new Map<number, InventoryBucket>();
          this.charactersBucketsArray[i] = new Array<InventoryBucket>();
          this.populateBucketMapFromResponse(inventoryResponses[i].items, this.charactersBucketsMap[i]);
          this.flattenInventoryBuckets(this.charactersBucketsMap[i], this.charactersBucketsArray[i]);
        }
      }).catch((error) => {
        this.sharedApp.showError("There was an error getting the inventory.", error);
      });

    }).catch(error => {
      this.sharedApp.showError("There was an error getting the account summary.", error);
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  // Converts an API response to a workable bucketMap
  private populateBucketMapFromResponse(bucketItemsResponse: Array<InventoryItem>, bucketsMap: Map<number, InventoryBucket>) {
    // Loop each vault item and place in to proper bucket
    bucketItemsResponse.forEach((vaultItem) => {
      var inventoryBucket: InventoryBucket = bucketsMap.get(vaultItem.bucketHash);

      // If the bucket for this vault item doesn't exist yet, create it
      if (inventoryBucket == null) {
        inventoryBucket = {
          hash: vaultItem.bucketHash,
          bucketValue: this.manifestService.getManifestEntry("DestinyInventoryBucketDefinition", vaultItem.bucketHash),
          items: new Array<InventoryItem>()
        }
        bucketsMap.set(vaultItem.bucketHash, inventoryBucket);
      }

      // Get the vault item definition 
      vaultItem.itemValue = this.manifestService.getManifestEntry("DestinyInventoryItemDefinition", vaultItem.itemHash);

      // Get the damage type definition, if exists
      if (vaultItem.damageTypeHash != 0)
        vaultItem.damageTypeValue = this.manifestService.getManifestEntry("DestinyDamageTypeDefinition", vaultItem.damageTypeHash);

      inventoryBucket.items.push(vaultItem);
    });
  }

  // Flattens a bucket map in to an array so it can be handled efficiently in .html
  private flattenInventoryBuckets(bucketsMap: Map<number, InventoryBucket>, bucketsArray: Array<InventoryBucket>) {
    // Add it to the flattened array
    bucketsMap.forEach((bucket, bucketHash) => {
      bucketsArray.push(bucket);
    });

    // Sort buckets
    bucketsArray.sort((a, b) => {
      return a.bucketValue.bucketOrder - b.bucketValue.bucketOrder;
    });
  }
}
