import { ManifestService } from '../../bungie/manifest/manifest.service';

import { InventoryBucket, InventoryItem} from 'app/bungie/services/interface.barrel';

export class InventoryUtils {

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

}