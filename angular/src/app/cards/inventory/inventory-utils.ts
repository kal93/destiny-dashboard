import { HttpService } from 'app/shared/services/http.service';
import { SharedBungie } from 'app/bungie/shared-bungie.service';
import { ManifestService } from '../../bungie/manifest/manifest.service';
import { SharedApp } from '../../shared/services/shared-app.service';

import { InventoryItemService } from 'app/bungie/services/service.barrel';
import { DestinyMembership, IAccountSummary, InventoryBucket, InventoryItem, InventoryTransferResult, SummaryCharacter } from 'app/bungie/services/interface.barrel';

export class InventoryUtils {

    private _bucketGroupsArray: Array<Array<Array<InventoryBucket>>>;
    private _bucketsMap: Array<Map<number, InventoryBucket>>
    private _selectedMembership: DestinyMembership;

    constructor(private inventoryItemService: InventoryItemService, private sharedBungie: SharedBungie, public sharedApp: SharedApp) {

    }

    setData(bucketGroupsArray: Array<Array<Array<InventoryBucket>>>, bucketsMap: Array<Map<number, InventoryBucket>>, selectedMembership: DestinyMembership) {
        this._bucketGroupsArray = bucketGroupsArray;
        this._bucketsMap = bucketsMap;
        this._selectedMembership = selectedMembership;
    }

    // Converts an API response to a workable bucketMap, and populates the hashes for bucket and items
    public static populateBucketMapFromResponse(characterIndex: number, manifestService: ManifestService, bucketItemsResponse: Array<InventoryItem>, bucketsMap: Map<number, InventoryBucket>) {
        // Loop each vault item and place in to proper bucket
        bucketItemsResponse.forEach((inventoryItem) => {
            // Get the vault item definition 
            inventoryItem.itemValue = manifestService.getManifestEntry("DestinyInventoryItemDefinition", inventoryItem.itemHash);

            // Set the character index so we can reference it later
            inventoryItem.characterIndex = characterIndex;

            let inventoryBucket: InventoryBucket = bucketsMap.get(inventoryItem.itemValue.bucketTypeHash);

            // If the bucket for this vault item doesn't exist yet, create it
            if (inventoryBucket == null) {
                inventoryBucket = {
                    hash: inventoryItem.itemValue.bucketTypeHash,
                    bucketValue: manifestService.getManifestEntry("DestinyInventoryBucketDefinition", inventoryItem.itemValue.bucketTypeHash),
                    items: new Array<InventoryItem>(),
                    filteredOut: false
                }
                bucketsMap.set(inventoryItem.itemValue.bucketTypeHash, inventoryBucket);
            }
            // Get the damage type definition, if exists
            if (inventoryItem.damageTypeHash != 0)
                inventoryItem.damageTypeValue = manifestService.getManifestEntry("DestinyDamageTypeDefinition", inventoryItem.damageTypeHash);

            inventoryBucket.items.push(inventoryItem);
        });
    }

    // Flattens a bucket map in to an array so it can be handled efficiently in .html
    public static populateBucketArrayFromMap(bucketsMap: Map<number, InventoryBucket>, bucketsArray: Array<InventoryBucket>) {
        // Add it to the flattened array
        bucketsMap.forEach((bucket, bucketHash) => {
            this.sortBucketItems(bucket);
            bucketsArray.push(bucket);
        });

        // Sort buckets by category, then bucketOrder
        bucketsArray.sort((a, b) => {
            if (a.bucketValue.category == b.bucketValue.category)
                return a.bucketValue.bucketOrder - b.bucketValue.bucketOrder;
            return b.bucketValue.category - a.bucketValue.category
        });
    }

    public static sortBucketItems(bucket: InventoryBucket) {
        // Sort items in bucket. transferStatus == 1 means it's selected
        bucket.items.sort((a: InventoryItem, b: InventoryItem) => {
            // Sort by whether if its in a transferrable status
            let statusA = (a.transferStatus % 2);
            let statusB = (b.transferStatus % 2);
            if (statusA == statusB) {
                // Sort by light level                
                let primaryStatA = a.primaryStat != null ? a.primaryStat.value : Number.MIN_SAFE_INTEGER;
                let primaryStatB = b.primaryStat != null ? b.primaryStat.value : Number.MIN_SAFE_INTEGER;

                if (primaryStatA == primaryStatB) {
                    // Light is same, sort by quantity
                    if (a.quantity != null && b.quantity != null) {
                        // Quantity is same, sort by name
                        if (a.quantity == b.quantity)
                            return b.itemValue.itemName > a.itemValue.itemName ? -1 : 1;
                        return b.quantity - a.quantity;
                    }
                }

                return primaryStatB - primaryStatA;
            }
            return statusB - statusA;
        });
    }

    public static groupBuckets(bucketGroupsArray: Array<Array<Array<InventoryBucket>>>, buckets: Array<InventoryBucket>, characterIndex: number) {
        // Create array for the character   [BucketGroup[Buckets]]
        bucketGroupsArray[characterIndex] = new Array<Array<InventoryBucket>>();
        bucketGroupsArray[characterIndex][0] = new Array<InventoryBucket>();

        let groupIndex: number = 0;
        for (let j = 0; j < buckets.length; j++) {
            let characterBucket = buckets[j];

            //If we're changing to a specific bucket type, let's break it in to a new group
            let bucketName = buckets[j].bucketValue.bucketName;
            if (bucketName == "Helmet" || bucketName == "Vehicle" || bucketName == "Shaders" || bucketName == "Materials" || bucketName == "Mission") {
                groupIndex++;
                bucketGroupsArray[characterIndex][groupIndex] = new Array<InventoryBucket>();
            }

            bucketGroupsArray[characterIndex][groupIndex].push(characterBucket);
        }
    }

    public static applyFilterToBucketGroups(searchText: string, showInventoryGroups: Array<boolean>, bucketGroups: Array<Array<InventoryBucket>>, skipAlreadyFiltered: boolean) {
        // For each bucketGroup in this character or vault
        for (let i = 0; i < bucketGroups.length; i++) {
            let bucketGroup = bucketGroups[i];
            // For each bucket in the current group
            for (let j = 0; j < bucketGroup.length; j++)
                InventoryUtils.applyFilterToBucket(searchText, showInventoryGroups, bucketGroup[j], skipAlreadyFiltered);
        }
    }

    /**
     * @param {boolean} skipAlreadyFiltered - Do not check items that have been filtered out since they'll definitely be filtered out again
     */
    public static applyFilterToBucket(searchText: string, showInventoryGroups: Array<boolean>, bucket: InventoryBucket, skipAlreadyFiltered: boolean) {
        let bucketName: string = bucket.bucketValue.bucketName;
        if ((!showInventoryGroups[0] && bucketName == "Bounties") || (!showInventoryGroups[1] && bucketName == "Emblems") ||
            (!showInventoryGroups[2] && bucketName == "Emotes") || (!showInventoryGroups[3] && bucketName == "Mission") ||
            (!showInventoryGroups[4] && bucketName == "Ornaments") || (!showInventoryGroups[5] && bucketName == "Shaders") ||
            (!showInventoryGroups[6] && bucketName == "Ships") || (!showInventoryGroups[7] && bucketName == "Sparrow Horn") ||
            (!showInventoryGroups[8] && bucketName == "Quests") || (!showInventoryGroups[9] && bucketName == "Vehicle")) {
            bucket.filteredOut = true;
            return;
        }

        let searchTextLower = searchText.toLowerCase().trim();
        let bucketHasItem = false;
        for (let i = 0; i < bucket.items.length; i++) {
            let inventoryItem = bucket.items[i];
            if (inventoryItem.filteredOut && skipAlreadyFiltered)
                continue;

            inventoryItem.filteredOut = false;
            if (inventoryItem.itemValue.itemName.toLowerCase().indexOf(searchTextLower) == -1)
                inventoryItem.filteredOut = true;
            else
                bucketHasItem = true;
        }
        bucket.filteredOut = !bucketHasItem;
    }

    transferItems(accountSummary: IAccountSummary, selectedInventoryItems: Array<InventoryItem>, destCharacterIndex: number, count: number): Promise<Array<Array<InventoryTransferResult>>> {
        return new Promise<Array<Array<InventoryTransferResult>>>((resolve, reject) => {
            let transferSuccesses = new Array<InventoryTransferResult>();
            let transferFailures = new Array<InventoryTransferResult>();
            let transferPromises = Array<Promise<any>>();

            for (let i = 0; i < selectedInventoryItems.length; i++) {
                let inventoryItem = selectedInventoryItems[i];

                // Don't transfer things that already exist in their destination
                if (inventoryItem.characterIndex == destCharacterIndex)
                    continue;

                let transferPromise;
                if (destCharacterIndex < 3 && inventoryItem.characterIndex < 3)
                    // Character to character transfer
                    transferPromise = this.transferItemCharacterToCharacter(inventoryItem, accountSummary.characters[inventoryItem.characterIndex],
                        accountSummary.characters[destCharacterIndex], count);
                else if (destCharacterIndex == 3)
                    // Character to vault
                    transferPromise = this.transferItemCharacterToVault(inventoryItem, accountSummary.characters[inventoryItem.characterIndex], count);
                else if (inventoryItem.characterIndex == 3)
                    // Vault to character
                    transferPromise = this.transferItemVaultToCharacter(inventoryItem, accountSummary.characters[destCharacterIndex], count);
                else
                    console.error("Unknown index for transfer");

                transferPromises.push(transferPromise.then((tranferResult: InventoryTransferResult) => {
                    tranferResult.inventoryItem = inventoryItem;
                    transferSuccesses.push(tranferResult);
                }).catch((tranferResult: InventoryTransferResult) => {
                    tranferResult.inventoryItem = inventoryItem;
                    transferFailures.push(tranferResult);
                }));
            }

            Promise.all(transferPromises).then(() => {
                resolve([transferSuccesses, transferFailures]);
            });
        });
    }

    transferItemCharacterToCharacter(inventoryItem: InventoryItem, srcCharacter: SummaryCharacter, destCharacter: SummaryCharacter, count: number): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.transferItemCharacterToVault(inventoryItem, srcCharacter, count).then(() => {
                this.transferItemVaultToCharacter(inventoryItem, destCharacter, count).then((response) => {
                    resolve(response);
                }).catch((error) => {
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });
        });
    }

    transferItemCharacterToVault(inventoryItem: InventoryItem, srcCharacter: SummaryCharacter, count: number): Promise<any> {
        return this.inventoryItemService.transferItem(this._selectedMembership, srcCharacter.characterBase.characterId, inventoryItem, count, true);
    }
    transferItemVaultToCharacter(inventoryItem: InventoryItem, destCharacter: SummaryCharacter, count: number): Promise<any> {
        return this.inventoryItemService.transferItem(this._selectedMembership, destCharacter.characterBase.characterId, inventoryItem, count, false);
    }

}