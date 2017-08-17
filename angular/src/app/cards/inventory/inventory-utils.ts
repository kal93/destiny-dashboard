import { ManifestService } from '../../bungie/manifest/manifest.service';
import { InventoryBucket, InventoryItem } from 'app/bungie/services/interface.barrel';

export class InventoryUtils {
    // Flattens a bucket map in to an array so it can be handled efficiently in .html
    public static flattenInventoryBuckets(bucketsMap: Map<number, InventoryBucket>, bucketsArray: Array<InventoryBucket>) {
        // Add it to the flattened array
        bucketsMap.forEach((bucket, bucketHash) => {
            // Sort items in bucket. transferStatus == 1 means it's selected
            bucket.items.sort((a: InventoryItem, b: InventoryItem) => {
                return (b.transferStatus % 2) - (a.transferStatus % 2);
            });

            bucketsArray.push(bucket);
        });

        // Sort buckets by category, then bucketOrder
        bucketsArray.sort((a, b) => {
            if (a.bucketValue.category == b.bucketValue.category)
                return a.bucketValue.bucketOrder - b.bucketValue.bucketOrder;
            return b.bucketValue.category - a.bucketValue.category
        });
    }

    // Converts an API response to a workable bucketMap, and populates the hashes for bucket and items
    public static populateBucketMapFromResponse(manifestService: ManifestService, bucketItemsResponse: Array<InventoryItem>, bucketsMap: Map<number, InventoryBucket>) {
        // Loop each vault item and place in to proper bucket
        bucketItemsResponse.forEach((inventoryItem) => {
            var inventoryBucket: InventoryBucket = bucketsMap.get(inventoryItem.bucketHash);

            // If the bucket for this vault item doesn't exist yet, create it
            if (inventoryBucket == null) {
                inventoryBucket = {
                    hash: inventoryItem.bucketHash,
                    bucketValue: manifestService.getManifestEntry("DestinyInventoryBucketDefinition", inventoryItem.bucketHash),
                    items: new Array<InventoryItem>(),
                    filteredOut: false
                }
                bucketsMap.set(inventoryItem.bucketHash, inventoryBucket);
            }

            // Get the vault item definition 
            inventoryItem.itemValue = manifestService.getManifestEntry("DestinyInventoryItemDefinition", inventoryItem.itemHash);

            // Get the damage type definition, if exists
            if (inventoryItem.damageTypeHash != 0)
                inventoryItem.damageTypeValue = manifestService.getManifestEntry("DestinyDamageTypeDefinition", inventoryItem.damageTypeHash);

            inventoryBucket.items.push(inventoryItem);
        });
    }
}