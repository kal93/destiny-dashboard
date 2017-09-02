import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';

import { DestinyMembership } from 'app/bungie/services/interface.barrel';
import { IAccountSummary, InventoryItem, InventoryBucket, InventoryItemTransferResult } from 'app/bungie/services/interface.barrel';
import { InventoryUtils } from 'app/bungie/services/destiny/inventory/inventory-utils';

@Injectable()
export class InventoryItemService {
    private _bucketsMap: Array<Map<number, InventoryBucket>>;
    private _selectedMembership: DestinyMembership;
    private _accountSummary: IAccountSummary;

    // Tally up the successes and failure
    private _transferSuccesses: Array<InventoryItemTransferResult>;
    private _transferFailures: Array<InventoryItemTransferResult>;

    // Delay transfers so we don't get yelled at by the API
    public static TRANSFER_DELAY = 500;

    constructor(protected http: HttpService, public sharedApp: SharedApp) { }

    transferItemToIndex(bucketsMap: Array<Map<number, InventoryBucket>>, selectedMembership: DestinyMembership, accountSummary: IAccountSummary, inventoryItem: InventoryItem, destCharacterIndex: number): Promise<Array<Array<InventoryItemTransferResult>>> {
        this._bucketsMap = bucketsMap;
        this._selectedMembership = selectedMembership;
        this._accountSummary = accountSummary;

        this._transferSuccesses = new Array<InventoryItemTransferResult>();
        this._transferFailures = new Array<InventoryItemTransferResult>();

        return new Promise<Array<Array<InventoryItemTransferResult>>>((resolve, reject) => {
            let transferPromises = Array<Promise<any>>();

            let transferPromise;
            if (destCharacterIndex < 3 && inventoryItem.characterIndex < 3)
                // Character to character transfer
                transferPromise = this.transferItemCharacterToCharacter(inventoryItem, destCharacterIndex, inventoryItem.transferQuantity);
            else if (destCharacterIndex == 3)
                // Character to vault
                transferPromise = this.transferItemCharacterToVault(inventoryItem, inventoryItem.transferQuantity);
            else if (inventoryItem.characterIndex == 3)
                // Vault to character
                transferPromise = this.transferItemVaultToCharacter(inventoryItem, destCharacterIndex, inventoryItem.transferQuantity);
            else
                console.error("Unknown index for transfer");

            transferPromises.push(transferPromise);

            Promise.all(transferPromises).then(() => {
                resolve([this._transferSuccesses, this._transferFailures]);
            });
        });
    }

    transferItemCharacterToCharacter(inventoryItem: InventoryItem, destCharacterIndex: number, count: number): Promise<InventoryItemTransferResult> {
        return new Promise<InventoryItemTransferResult>((resolve, reject) => {
            this.transferItemCharacterToVault(inventoryItem, count).then((transferResult: InventoryItemTransferResult) => {
                // 1 = no error
                if (transferResult.ErrorCode == 1) {
                    setTimeout(() => {
                        this.transferItemVaultToCharacter(inventoryItem, destCharacterIndex, count).then((transferResult: InventoryItemTransferResult) => {
                            resolve(transferResult);
                        });
                    }, InventoryItemService.TRANSFER_DELAY);
                }
                else
                    resolve(transferResult);

            }).catch((transferError: InventoryItemTransferResult) => {
                this.sharedApp.showError("Unexpected error when transferring item Character to Vault", transferError);
                reject(transferError);
            });
        });
    }

    transferItemCharacterToVault(inventoryItem: InventoryItem, count: number): Promise<InventoryItemTransferResult> {
        return new Promise<InventoryItemTransferResult>((resolve, reject) => {
            let srcCharacterIndex = inventoryItem.characterIndex;
            let srcCharacter = this._accountSummary.characters[srcCharacterIndex];
            if (InventoryUtils.isItemEquipped(inventoryItem)) {
                // If trying to transfer an equipped item, need to unequip it first, then transfer it
                let srcBucket = this._bucketsMap[srcCharacterIndex].get(inventoryItem.itemValue.bucketTypeHash);
                let highestValueItem = InventoryUtils.getUnequippedHighestValueNonExoticItemFromBucket(srcBucket);
                if (highestValueItem == null) {
                    var tranferResult: any = { inventoryItem: inventoryItem, Message: "Could not unequip the item in order to transfer it." };
                    this._transferFailures.push(tranferResult);
                    resolve(tranferResult);
                }
                else {
                    this.equipItem(this._selectedMembership, srcCharacter.characterBase.characterId, srcCharacterIndex, highestValueItem).then(() => {
                        setTimeout(() => {
                            resolve(this.transferItem(this._selectedMembership, srcCharacter.characterBase.characterId, 3, inventoryItem, count, true));
                        }, InventoryItemService.TRANSFER_DELAY);
                    });
                }
            }
            else {
                // Make sure the vault can handle whatever we're trying to transfer
                resolve(this.transferItem(this._selectedMembership, srcCharacter.characterBase.characterId, 3, inventoryItem, count, true));
            }
        });
    }

    transferItemVaultToCharacter(inventoryItem: InventoryItem, destCharacterIndex: number, count: number): Promise<InventoryItemTransferResult> {
        return new Promise<InventoryItemTransferResult>((resolve, reject) => {
            // Make sure destination character inventory has room to transfer
            let destBucket = this._bucketsMap[destCharacterIndex].get(inventoryItem.itemValue.bucketTypeHash);
            let destCharacter = this._accountSummary.characters[destCharacterIndex];

            // If the destination bucket is full, transfer out the lowest value item (Full stack if possible)
            if (InventoryUtils.isBucketFull(destBucket)) {
                let lowestValueItem = InventoryUtils.getUnequippedLowestValueItemFromBucket(destBucket);

                setTimeout(() => {
                    this.transferItemCharacterToVault(lowestValueItem, lowestValueItem.quantity).then(() => {
                        this.sharedApp.showInfo("Destination was full, transferred " + lowestValueItem.itemValue.itemName + " to your vault to make room", { timeOut: 3000 });

                        setTimeout(() => {
                            resolve(this.transferItem(this._selectedMembership, destCharacter.characterBase.characterId, destCharacterIndex, inventoryItem, count, false));
                        }, InventoryItemService.TRANSFER_DELAY);
                    });
                }, InventoryItemService.TRANSFER_DELAY);
            }
            else
                resolve(this.transferItem(this._selectedMembership, destCharacter.characterBase.characterId, destCharacterIndex, inventoryItem, count, false));
        });
    }

    private transferItem(membership: DestinyMembership, targetCharacterId: string, destCharacterIndex: number, inventoryItem: InventoryItem, count: number, toVault: boolean): Promise<InventoryItemTransferResult> {
        // Build the request URL
        let requestUrl = "https://www.bungie.net/d1/Platform/Destiny/TransferItem/";

        let body = {
            characterId: targetCharacterId,
            membershipType: membership.membershipType,
            itemId: inventoryItem.itemId,
            itemReferenceHash: inventoryItem.itemHash,
            stackSize: count,
            transferToVault: toVault,
        };

        //Get the response, or return the cached result
        return this.http.postBungie(requestUrl, body).then((tranferResult: InventoryItemTransferResult) => {
            let srcBucket: InventoryBucket = this._bucketsMap[inventoryItem.characterIndex].get(inventoryItem.itemValue.bucketTypeHash);
            let sourceBucketItems: Array<InventoryItem> = srcBucket.items;

            // Remove this item from the sourceArray
            sourceBucketItems.splice(sourceBucketItems.indexOf(inventoryItem), 1);

            let destBucket: InventoryBucket = this._bucketsMap[destCharacterIndex].get(inventoryItem.itemValue.bucketTypeHash);
            // If this bucket doesn't exist yet, let the callee know so we can refresh the inventory from network request
            if (destBucket == null)
                tranferResult.refreshRequired = true;
            else
                destBucket.items.push(inventoryItem);

            // Update inventory item with new characterIndex
            inventoryItem.characterIndex = destCharacterIndex;

            // Sort after we insert the new item
            InventoryUtils.sortBucketItems(destBucket);

            tranferResult.inventoryItem = inventoryItem;
            this._transferSuccesses.push(tranferResult);
            return tranferResult;
        }).catch((tranferResult: InventoryItemTransferResult) => {
            tranferResult.inventoryItem = inventoryItem;
            this._transferFailures.push(tranferResult);
            return tranferResult;
        });
    }

    private equipItem(membership: DestinyMembership, characterId: string, destCharacterIndex: number, inventoryItem: InventoryItem): Promise<InventoryItemTransferResult> {
        let requestUrl = "https://www.bungie.net/d1/Platform/Destiny/EquipItem/";
        let destBucket: InventoryBucket = this._bucketsMap[destCharacterIndex].get(inventoryItem.itemValue.bucketTypeHash);

        //Mark currently equipped item as unequipped
        let equippedItem = InventoryUtils.getEquippedItemFromBucket(destBucket);
        if (equippedItem != null)
            equippedItem.transferStatus = 0;

        //Mark target item as equipped
        inventoryItem.transferStatus = 1;

        // Sort after we insert the new item
        InventoryUtils.sortBucketItems(destBucket);

        let body = {
            membershipType: membership.membershipType,
            itemId: inventoryItem.itemId,
            characterId: characterId
        };

        return this.http.postBungie(requestUrl, body);
    }

    /*  private equipItems(membership: DestinyMembership, characterId: string, itemIds: Array<number>): Promise<InventoryItemTransferResult> {
        let requestUrl = "https://www.bungie.net/d1/Platform/Destiny/EquipItem/";
        let body = {            characterId: characterId,            membershipType: membership.membershipType,            itemIds: itemIds        };
        return this.http.postBungie(requestUrl, body);
    }*/
} 