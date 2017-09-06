import { ManifestService } from '../../../manifest/manifest.service';

import { CharacterBase, InventoryBucket, InventoryItem } from 'app/bungie/services/interface.barrel';
import { ClassTypes, TierTypes } from 'app/bungie/services/enums.interface';

export class InventoryUtils {

    // Converts an API response to a workable bucketMap, and populates the hashes for bucket and items
    public static populateBucketMapFromResponse(characterIndex: number, manifestService: ManifestService, bucketItemsResponse: Array<InventoryItem>, inventoryItemHashMap: Map<string, InventoryItem>, bucketsMap: Map<number, InventoryBucket>) {
        // Loop each vault item and place in to proper bucket
        bucketItemsResponse.forEach((inventoryItem) => {
            // Get the vault item definition 
            inventoryItem.itemValue = manifestService.getManifestEntry("DestinyInventoryItemDefinition", inventoryItem.itemHash);

            // Set the character index so we can reference it later
            inventoryItem.characterIndex = characterIndex;

            let inventoryBucket: InventoryBucket = bucketsMap.get(inventoryItem.itemValue.inventory.bucketTypeHash);

            // If the bucket for this vault item doesn't exist yet, create it
            if (inventoryBucket == null) {
                let bucketValue = manifestService.getManifestEntry("DestinyInventoryBucketDefinition", inventoryItem.itemValue.inventory.bucketTypeHash);
                inventoryBucket = {
                    hash: inventoryItem.itemValue.inventory.bucketTypeHash,
                    bucketValue: bucketValue,
                    items: new Array<InventoryItem>(),
                    filteredOut: false
                }
                if (bucketValue.category != 0)
                    bucketsMap.set(inventoryItem.itemValue.inventory.bucketTypeHash, inventoryBucket);
            }
            // Get the damage type definition, if exists
            if (inventoryItem.itemValue.defaultDamageTypeHash != 0)
                inventoryItem.damageTypeValue = manifestService.getManifestEntry("DestinyDamageTypeDefinition", inventoryItem.itemValue.defaultDamageTypeHash);

            inventoryBucket.items.push(inventoryItem);

            // Add this item to the inventoryItemHash map
            inventoryItemHashMap.set(inventoryItem.itemInstanceId, inventoryItem);
        });
    }

    // Flattens a bucket map in to an array so it can be handled efficiently in .html
    public static populateBucketArrayFromMap(bucketsMap: Map<number, InventoryBucket>, bucketsArray: Array<InventoryBucket>, ignoreEquipped: boolean = false) {
        // Add it to the flattened array
        bucketsMap.forEach((bucket, bucketHash) => {
            InventoryUtils.sortBucketItems(bucket, ignoreEquipped);
            bucketsArray.push(bucket);
        });

        // Sort buckets by category, then bucketOrder
        bucketsArray.sort((a, b) => {
            if (a.bucketValue.category == b.bucketValue.category)
                return a.bucketValue.bucketOrder - b.bucketValue.bucketOrder;
            return b.bucketValue.category - a.bucketValue.category
        });
    }

    public static sortBucketItems(bucket: InventoryBucket, ignoreEquipped: boolean = false) {
        if (bucket == null) return;
        // Sort items in bucket. transferStatus == 1 means it's selected
        bucket.items.sort((a: InventoryItem, b: InventoryItem) => {
            // Sort by whether if its in a transferrable status
            let statusA = 0, statusB = 0;
            if (!ignoreEquipped) {
                statusA = (a.transferStatus % 2);
                statusB = (b.transferStatus % 2);
            }
            if (statusA == statusB) {
                // Sort by light level                
                let primaryStatA = a.primaryStat != null ? a.primaryStat.value : Number.MIN_SAFE_INTEGER;
                let primaryStatB = b.primaryStat != null ? b.primaryStat.value : Number.MIN_SAFE_INTEGER;

                if (primaryStatA == primaryStatB) {
                    // Light is same, sort by quantity
                    if (a.quantity != null && b.quantity != null) {
                        // Quantity is same, sort by name
                        if (a.quantity == b.quantity)
                            return b.itemValue.displayProperties.name > a.itemValue.displayProperties.name ? -1 : 1;
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
            let bucketName = buckets[j].bucketValue.displayProperties.name;
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
        let bucketName: string = bucket.bucketValue.displayProperties.name;
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
            if (inventoryItem.itemValue.displayProperties.name.toLowerCase().indexOf(searchTextLower) == -1)
                inventoryItem.filteredOut = true;
            else
                bucketHasItem = true;
        }
        bucket.filteredOut = !bucketHasItem;
    }

    public static isItemEquippableOnCharacter(inventoryItem: InventoryItem, character: CharacterBase): boolean {
        if (!inventoryItem.itemValue.equippable)
            return false;
        if (inventoryItem.itemValue.classType != ClassTypes.UNKNOWN && inventoryItem.itemValue.classType != character.classType)
            return false;

        return true;
    }

    public static isItemEquipped(inventoryItem: InventoryItem): boolean {
        return inventoryItem.transferStatus % 2 == 1;
    }

    public static isBucketFull(destBucket: InventoryBucket): boolean {
        if (destBucket == null) return false;
        return destBucket.bucketValue.itemCount == destBucket.items.length;
    }

    public static getEquippedItemFromBucket(destBucket: InventoryBucket): InventoryItem {
        if (destBucket == null) return null;
        for (let i = 0; i < destBucket.items.length; i++) {
            if (InventoryUtils.isItemEquipped(destBucket.items[i]))
                return destBucket.items[i];
        }
        console.log("No equipped item found in bucket");
        return null;
    }

    public static getUnequippedLowestValueItemFromBucket(destBucket: InventoryBucket, allowExotic: boolean = true): InventoryItem {
        if (destBucket == null) return null;
        let lowestValueItem: InventoryItem;
        for (let i = 0; i < destBucket.items.length; i++) {
            let inventoryItem = destBucket.items[i];
            if (InventoryUtils.isItemEquipped(inventoryItem))
                continue;
            if (!allowExotic && inventoryItem.itemValue.inventory.tierType == TierTypes.EXOTIC)
                continue;
            if (!lowestValueItem) {
                lowestValueItem = inventoryItem;
                continue;
            }
            else {
                if (inventoryItem.primaryStat != null) {
                    // Weapon or armor being transferred
                    if (inventoryItem.primaryStat.value < lowestValueItem.primaryStat.value)
                        lowestValueItem = inventoryItem;
                }
                else {
                    // Material or something else
                    if (inventoryItem.quantity < lowestValueItem.quantity)
                        lowestValueItem = inventoryItem;
                }
            }
        }
        return lowestValueItem;
    }

    public static getUnequippedHighestValueItemFromBucket(destBucket: InventoryBucket, allowExotic: boolean = true): InventoryItem {
        if (destBucket == null) return null;
        let highestValueItem: InventoryItem;
        for (let i = 0; i < destBucket.items.length; i++) {
            let inventoryItem = destBucket.items[i];
            if (InventoryUtils.isItemEquipped(inventoryItem))
                continue;
            if (!allowExotic && inventoryItem.itemValue.inventory.tierType == TierTypes.EXOTIC)
                continue;
            if (!highestValueItem) {
                highestValueItem = inventoryItem;
                continue;
            }
            else {
                if (inventoryItem.primaryStat != null) {
                    // Weapon or armor being transferred
                    if (inventoryItem.primaryStat.value > highestValueItem.primaryStat.value)
                        highestValueItem = inventoryItem;
                }
                else {
                    // Material or something else
                    if (inventoryItem.quantity > highestValueItem.quantity)
                        highestValueItem = inventoryItem;
                }
            }
        }
        return highestValueItem;
    }
}