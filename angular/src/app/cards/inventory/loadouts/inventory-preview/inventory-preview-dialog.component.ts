import { Component, ViewChild } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { SimpleInputDialog } from '../../../../shared/dialogs/simple-input.component';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { InventoryUtils } from 'app/bungie/services/destiny/inventory/inventory-utils';
import { SharedApp } from 'app/shared/services/shared-app.service';

import { InventoryBucket, InventoryItem } from 'app/bungie/services/interface.barrel';
import { ItemTypes } from 'app/bungie/services/enums.interface';

@Component({
    templateUrl: './inventory-preview-dialog.component.html',
    styleUrls: ['./inventory-preview-dialog.component.scss']
})
export class InventoryPreviewDialog {
    // Inputs
    inventoryItemHashMap: Map<string, InventoryItem>;
    selectedInventoryItems: Array<InventoryItem>;
    acceptableBucketGroups: Array<string>;
    title: string;

    inventoryBuckets: Array<InventoryBucket>;

    MAX_INVENTORY_ITEMS: number = 12;


    constructor(public dialogRef: MdDialogRef<InventoryPreviewDialog>, public mdDialog: MdDialog, public manifestService: ManifestService,
        private sharedApp: SharedApp) {
        this.dialogRef.disableClose = true;
    }

    ngOnInit() {
        // Set items in the selected list to be selected so we can show this on the UI
        this.selectedInventoryItems.forEach((inventoryItem) => { inventoryItem.selected = true; });
        this.initInventoryBuckets();
    }

    ngOnDestroy() {
        // Set .selected to false so we're not changing the UI
        this.selectedInventoryItems.forEach((inventoryItem) => { inventoryItem.selected = false; });
    }

    initInventoryBuckets() {
        let acceptableBucketGroupsMap = new Map<string, boolean>();
        this.acceptableBucketGroups.forEach((bucketGroupName) => {
            acceptableBucketGroupsMap.set(bucketGroupName, true);
        });

        // Sort inventory items in to their respective buckets
        this.inventoryBuckets = new Array<InventoryBucket>();
        let bucketsMap = new Map<number, InventoryBucket>();

        this.inventoryItemHashMap.forEach((inventoryItem: InventoryItem, inventoryItemId: string) => {
            // Check if item is transferrable, and is not an engram
            if (!inventoryItem.itemValue.nonTransferrable && inventoryItem.itemValue.itemType != ItemTypes.ENGRAM) {
                // Check if inventory item is in an acceptable bucket
                let inventoryItemBucketValue = this.manifestService.getManifestEntry("DestinyInventoryBucketDefinition", inventoryItem.itemValue.inventory.bucketTypeHash);
                if (acceptableBucketGroupsMap.has(inventoryItemBucketValue.bucketName)) {
                    let inventoryBucket: InventoryBucket = bucketsMap.get(inventoryItem.itemValue.inventory.bucketTypeHash);

                    // If the bucket for this vault item doesn't exist yet, create it
                    if (inventoryBucket == null) {
                        inventoryBucket = {
                            hash: inventoryItem.itemValue.inventory.bucketTypeHash,
                            bucketValue: inventoryItemBucketValue,
                            items: new Array<InventoryItem>(),
                            filteredOut: false
                        }
                        bucketsMap.set(inventoryItem.itemValue.inventory.bucketTypeHash, inventoryBucket);
                    }
                    inventoryBucket.items.push(inventoryItem);
                }
            }
        });

        // Once we have a map of the buckets and their inventory items, sort bucket items and put in to array
        this.inventoryBuckets = new Array<InventoryBucket>();
        InventoryUtils.populateBucketArrayFromMap(bucketsMap, this.inventoryBuckets, true);
    }

    inventoryItemClicked(inventoryItem: InventoryItem) {
        var selecting = !inventoryItem.selected;
        if (selecting) {
            // Make sure we do not allow to add more than max
            if (this.selectedInventoryItems.length == this.MAX_INVENTORY_ITEMS) {
                this.sharedApp.showWarning("A maximum of " + this.MAX_INVENTORY_ITEMS + " items can be added to a loadout.");
                return;
            }
            inventoryItem.selected = true;
            this.selectedInventoryItems.push(inventoryItem);
        }
        else {
            inventoryItem.selected = false;
            this.selectedInventoryItems.splice(this.selectedInventoryItems.indexOf(inventoryItem), 1);
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }

}