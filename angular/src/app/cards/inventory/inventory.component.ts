import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MdTabGroup } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { inventoryService } from './inventory.service';
import { ManifestService } from '../../bungie/manifest/manifest.service';
import { SharedBungie } from '../../bungie/shared-bungie.service';
import { SharedApp } from '../../shared/services/shared-app.service';

import { AccountSummaryService } from 'app/bungie/services/service.barrel';
import { DestinyMembership, InventoryBucket, InventoryItem, IAccountSummary, IVaultSummary, SummaryCharacter } from 'app/bungie/services/interface.barrel';

import { expandInShrinkOut } from '../../shared/animations';

@Component({
    selector: 'dd-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: ['../_base/card.component.scss', './inventory.component.scss'],
    animations: [expandInShrinkOut()],
    providers: [inventoryService]
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

    // Array of character buckets for display in .html. Array position matches caracter position in this.accountSummary.characters. Character[Buckets]
    charactersBucketsArray: Array<Array<InventoryBucket>> = new Array<Array<InventoryBucket>>();

    // Inception level 4. Character[BucketGroup[Buckets]]
    charactersBucketsGroupsArray: Array<Array<Array<InventoryBucket>>>;

    // Tower definition from the manifest so we can have the icon
    towerDefinition: any;

    // Keep track if a user has collapsed a section
    collapsedSections: Array<boolean>;

    constructor(private accountSummaryService: AccountSummaryService, private changeDetectorRef: ChangeDetectorRef,
        public domSanitizer: DomSanitizer, private inventoryService: inventoryService, private manifestService: ManifestService, private sharedBungie: SharedBungie, public sharedApp: SharedApp) {
        super(sharedApp);
    }

    ngOnInit() {
        super.ngOnInit();

        // Set collapsed sections
        this.collapsedSections = this.getCardLocalStorageAsJsonObject("collapsedSections", [false, false, false, false]);

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
            this.inventoryService.getFullInventory(this.selectedMembership, this.accountSummary).then((inventoryResponses) => {
                // Vault is the first response
                var vaultSummaryResponse: IVaultSummary = inventoryResponses.shift();

                // Populate vault buckets
                this.vaultBucketsMap = new Map<number, InventoryBucket>();
                this.vaultBucketsArray = new Array<InventoryBucket>();
                this.populateBucketMapFromResponse(vaultSummaryResponse.items, this.vaultBucketsMap);
                this.flattenInventoryBuckets(this.vaultBucketsMap, this.vaultBucketsArray);

                // Init the array for the character buckets map and bucketsGroupArray. Should be the same size as the number of characters we have.
                this.charactersBucketsMap = new Array<Map<number, InventoryBucket>>(inventoryResponses.length);

                this.charactersBucketsGroupsArray = new Array<Array<Array<InventoryBucket>>>(inventoryResponses.length);
                // All remaining responses should be characters
                for (var i = 0; i < inventoryResponses.length; i++) {
                    this.charactersBucketsMap[i] = new Map<number, InventoryBucket>();
                    this.charactersBucketsArray[i] = new Array<InventoryBucket>();
                    this.populateBucketMapFromResponse(inventoryResponses[i].items, this.charactersBucketsMap[i]);
                    this.flattenInventoryBuckets(this.charactersBucketsMap[i], this.charactersBucketsArray[i]);

                    // Group character buckets in to separate arrays based on their category id
                    this.groupCharactersBuckets(this.charactersBucketsArray[i], i);
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

    // Converts an API response to a workable bucketMap, and populates the hashes for bucket and items
    private populateBucketMapFromResponse(bucketItemsResponse: Array<InventoryItem>, bucketsMap: Map<number, InventoryBucket>) {
        // Loop each vault item and place in to proper bucket
        bucketItemsResponse.forEach((inventoryItem) => {
            var inventoryBucket: InventoryBucket = bucketsMap.get(inventoryItem.bucketHash);

            // If the bucket for this vault item doesn't exist yet, create it
            if (inventoryBucket == null) {
                inventoryBucket = {
                    hash: inventoryItem.bucketHash,
                    bucketValue: this.manifestService.getManifestEntry("DestinyInventoryBucketDefinition", inventoryItem.bucketHash),
                    items: new Array<InventoryItem>()
                }
                bucketsMap.set(inventoryItem.bucketHash, inventoryBucket);
            }

            // Get the vault item definition 
            inventoryItem.itemValue = this.manifestService.getManifestEntry("DestinyInventoryItemDefinition", inventoryItem.itemHash);

            // Get the damage type definition, if exists
            if (inventoryItem.damageTypeHash != 0)
                inventoryItem.damageTypeValue = this.manifestService.getManifestEntry("DestinyDamageTypeDefinition", inventoryItem.damageTypeHash);

            inventoryBucket.items.push(inventoryItem);
        });
    }

    // Flattens a bucket map in to an array so it can be handled efficiently in .html
    private flattenInventoryBuckets(bucketsMap: Map<number, InventoryBucket>, bucketsArray: Array<InventoryBucket>) {
        // Add it to the flattened array
        bucketsMap.forEach((bucket, bucketHash) => { bucketsArray.push(bucket); });

        // Sort buckets
        bucketsArray.sort((a, b) => {
            if (a.bucketValue.category == b.bucketValue.category)
                return a.bucketValue.bucketOrder - b.bucketValue.bucketOrder;
            return b.bucketValue.category - a.bucketValue.category
        });
    }

    private groupCharactersBuckets(characterBuckets: Array<InventoryBucket>, characterIndex: number) {
        // Create array for the character             [BucketGroup[Buckets]]
        this.charactersBucketsGroupsArray[characterIndex] = new Array<Array<InventoryBucket>>();
        this.charactersBucketsGroupsArray[characterIndex][0] = new Array<InventoryBucket>();

        var groupIndex: number = 0;
        for (var j = 0; j < characterBuckets.length; j++) {
            let characterBucket = characterBuckets[j];

            //If we're changing to a specific bucket type, let's break it in to a new group
            var bucketName = characterBuckets[j].bucketValue.bucketName;
            if (bucketName == "Helmet" || bucketName == "Vehicle" || bucketName == "Shaders" || bucketName == "Materials" || bucketName == "Mission")
                this.charactersBucketsGroupsArray[characterIndex][++groupIndex] = new Array<InventoryBucket>();

            this.charactersBucketsGroupsArray[characterIndex][groupIndex].push(characterBucket);
        }
    }

    refreshCharacter(characterIndex: number) {
        let character: SummaryCharacter = this.accountSummary.characters[characterIndex];

        this.inventoryService.clearCharacterInventoryCache(this.selectedMembership, character.characterBase.characterId);
        this.inventoryService.getCharacterInventory(this.selectedMembership, character.characterBase.characterId).then((inventoryResponse) => {
            this.charactersBucketsMap[characterIndex] = new Map<number, InventoryBucket>();
            this.charactersBucketsArray[characterIndex] = new Array<InventoryBucket>();
            this.populateBucketMapFromResponse(inventoryResponse.items, this.charactersBucketsMap[characterIndex]);
            this.flattenInventoryBuckets(this.charactersBucketsMap[characterIndex], this.charactersBucketsArray[characterIndex]);
            this.groupCharactersBuckets(this.charactersBucketsArray[characterIndex], characterIndex);
        });
    }

    refreshVault() {
        this.inventoryService.clearVaultInventoryCache(this.selectedMembership);
        this.inventoryService.getVaultInventory(this.selectedMembership).then((vaultSummaryResponse: IVaultSummary) => {
            // Populate vault buckets
            this.vaultBucketsMap = new Map<number, InventoryBucket>();
            this.vaultBucketsArray = new Array<InventoryBucket>();
            this.populateBucketMapFromResponse(vaultSummaryResponse.items, this.vaultBucketsMap);
            this.flattenInventoryBuckets(this.vaultBucketsMap, this.vaultBucketsArray);
        });
    }

    collapseSection(sectionIndex: number) {
        this.collapsedSections[sectionIndex] = !this.collapsedSections[sectionIndex];
        this.setCardLocalStorage("collapsedSections", JSON.stringify(this.collapsedSections));
    }
}
