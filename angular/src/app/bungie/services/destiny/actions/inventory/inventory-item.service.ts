import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';

import { DestinyMembership } from 'app/bungie/services/interface.barrel';
import { IAccountSummary, InventoryItem, InventoryBucket, InventoryItemTransferResult } from 'app/bungie/services/interface.barrel';
import { InventoryUtils } from './inventory-utils';

import { ErrorTypes } from 'app/bungie/services/errors.interface';

@Injectable()
export class InventoryItemService {
    private _bucketsMap: Array<Map<number, InventoryBucket>>;
    private _selectedMembership: DestinyMembership;
    private _accountSummary: IAccountSummary;

    // Tally up the successes and failure
    private _transferSuccesses: Array<InventoryItemTransferResult>;
    private _transferFailures: Array<InventoryItemTransferResult>;

    // Delay transfers so we don't get yelled at by the API
    public static TRANSFER_DELAY = 400;

    constructor(protected http: HttpService, public sharedApp: SharedApp) { }

    setData(bucketsMap: Array<Map<number, InventoryBucket>>, selectedMembership: DestinyMembership, accountSummary: IAccountSummary) {
        this._bucketsMap = bucketsMap;
        this._selectedMembership = selectedMembership;
        this._accountSummary = accountSummary;
    }

    transferItemToIndex(inventoryItem: InventoryItem, destCharacterIndex: number): Promise<Array<Array<InventoryItemTransferResult>>> {
        this._transferSuccesses = new Array<InventoryItemTransferResult>();
        this._transferFailures = new Array<InventoryItemTransferResult>();

        console.log("INVENTORY-ITEM 1");
        return new Promise<Array<Array<InventoryItemTransferResult>>>((resolve, reject) => {
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

            transferPromise.then(() => {
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
            let srcCharacter = this._accountSummary.characterData[srcCharacterIndex];
            if (InventoryUtils.isItemEquipped(inventoryItem)) {
                // If trying to transfer an equipped item, need to unequip it first, then transfer it
                let srcBucket = this._bucketsMap[srcCharacterIndex].get(inventoryItem.itemValue.inventory.bucketTypeHash);
                let highestValueItem = InventoryUtils.getUnequippedHighestValueItemFromBucket(srcBucket, false);
                if (highestValueItem != null) {
                    // We have found an item to equip so we can unequip the item we're trying to transfer
                    this.equipItem(highestValueItem).then(() => {
                        setTimeout(() => {
                            resolve(this.transferItem(srcCharacter.characterId, 3, inventoryItem, count, true));
                        }, InventoryItemService.TRANSFER_DELAY);
                    });
                }
                else {
                    // If we're trying to unequip it but can't, try transfer junk from vault first.
                    let vaultBucket = this._bucketsMap[3].get(inventoryItem.itemValue.inventory.bucketTypeHash);
                    let lowestValueItemFromVault = InventoryUtils.getUnequippedLowestValueItemFromBucket(vaultBucket, false);
                    // If even after all of that, we couldn't get anything from the vault, throw an error
                    if (lowestValueItemFromVault == null) {
                        let tranferResult: any = { inventoryItem: inventoryItem, Message: "Could not unequip the item in order to transfer it." };
                        this._transferFailures.push(tranferResult);
                        return resolve(tranferResult);
                    }

                    // Get junk item from vault so we can unequip our current item
                    this.transferItemVaultToCharacter(lowestValueItemFromVault, inventoryItem.characterIndex, count).then((transferResult: InventoryItemTransferResult) => {
                        this.sharedApp.showInfo("Transferred " + lowestValueItemFromVault.itemValue.displayProperties.name + " from vault to un-equip " + inventoryItem.itemValue.displayProperties.name, { timeOut: 3000 });

                        // Equip junk item
                        setTimeout(() => {
                            this.equipItem(lowestValueItemFromVault).then(() => {
                                setTimeout(() => {
                                    // Finally, transfer our current item out
                                    resolve(this.transferItem(srcCharacter.characterId, 3, inventoryItem, count, true));
                                }, InventoryItemService.TRANSFER_DELAY);
                            });
                        }, InventoryItemService.TRANSFER_DELAY);
                    });
                }
            }
            else {
                // Make sure the vault can handle whatever we're trying to transfer
                resolve(this.transferItem(srcCharacter.characterId, 3, inventoryItem, count, true));
            }
        });
    }

    transferItemVaultToCharacter(inventoryItem: InventoryItem, destCharacterIndex: number, count: number): Promise<InventoryItemTransferResult> {
        return new Promise<InventoryItemTransferResult>((resolve, reject) => {
            // Make sure destination character inventory has room to transfer
            let destBucket = this._bucketsMap[destCharacterIndex].get(inventoryItem.itemValue.inventory.bucketTypeHash);
            let destCharacter = this._accountSummary.characterData[destCharacterIndex];

            // If the destination bucket is full, transfer out the lowest value item (Full stack if possible)
            if (InventoryUtils.isBucketFull(destBucket)) {
                let lowestValueItem = InventoryUtils.getUnequippedLowestValueItemFromBucket(destBucket);
                this.transferItemCharacterToVault(lowestValueItem, lowestValueItem.quantity).then(() => {
                    this.sharedApp.showInfo("Destination was full, transferred " + lowestValueItem.itemValue.displayProperties.name + " to your vault to make room", { timeOut: 3000 });

                    setTimeout(() => {
                        resolve(this.transferItem(destCharacter.characterId, destCharacterIndex, inventoryItem, count, false));
                    }, InventoryItemService.TRANSFER_DELAY);
                });
            }
            else
                resolve(this.transferItem(destCharacter.characterId, destCharacterIndex, inventoryItem, count, false));
        });
    }

    private transferItem(targetCharacterId: string, destCharacterIndex: number, inventoryItem: InventoryItem, count: number, toVault: boolean): Promise<InventoryItemTransferResult> {
        // Build the request URL
        let requestUrl = "https://www.bungie.net/Platform/Destiny2/Actions/Items/TransferItem/";

        console.log("INVENTORY-ITEM 2");
        let body = {
            characterId: targetCharacterId,
            membershipType: this._selectedMembership.membershipType,
            itemId: inventoryItem.itemInstanceId,
            itemReferenceHash: inventoryItem.itemHash,
            stackSize: count,
            transferToVault: toVault,
        };

        //Get the response, or return the cached result
        return this.http.postBungie(requestUrl, body).then((tranferResult: InventoryItemTransferResult) => {
            console.log("INVENTORY-ITEM 3");
            let srcBucket: InventoryBucket = this._bucketsMap[inventoryItem.characterIndex].get(inventoryItem.itemValue.inventory.bucketTypeHash);

            // srcBucket can be null if we are transfering from Character -> Vault -> Character and the value didn't have anything in this bucket
            if (srcBucket != null) {
                let sourceBucketItems: Array<InventoryItem> = srcBucket.items;
                // Remove this item from the sourceArray
                sourceBucketItems.splice(sourceBucketItems.indexOf(inventoryItem), 1);
            }

            let destBucket: InventoryBucket = this._bucketsMap[destCharacterIndex].get(inventoryItem.itemValue.inventory.bucketTypeHash);
            // If this bucket doesn't exist yet, let the callee know so we can refresh the inventory from network request
            if (destBucket == null)
                tranferResult.refreshRequired = true;
            else {
                tranferResult.refreshRequired = false;
                destBucket.items.push(inventoryItem);
                InventoryUtils.sortBucketItems(destBucket);
            }

            // Update inventory item with new characterIndex
            inventoryItem.characterIndex = destCharacterIndex;

            tranferResult.inventoryItem = inventoryItem;
            this._transferSuccesses.push(tranferResult);
            return tranferResult;
        }).catch((tranferResult: InventoryItemTransferResult) => {
            // Clean up dumb message
            if (tranferResult.ErrorCode == ErrorTypes.DestinyUniquenessViolation)
                tranferResult.Message = "You can only have one of these on a character/vault at a time.";
            tranferResult.inventoryItem = inventoryItem;
            this._transferFailures.push(tranferResult);
            return tranferResult;
        });
    }

    public equipItem(inventoryItem: InventoryItem): Promise<InventoryItemTransferResult> {
        try {
            let srcCharacterId = this._accountSummary.characterData[inventoryItem.characterIndex].characterId;

            let requestUrl = "https://www.bungie.net/Platform/Destiny2/Actions/Items/EquipItem/";
            let body = {
                characterId: srcCharacterId,
                membershipType: this._selectedMembership.membershipType,
                itemId: inventoryItem.itemInstanceId
            };

            return this.http.postBungie(requestUrl, body).then((response) => {
                let srcBucket: InventoryBucket = this._bucketsMap[inventoryItem.characterIndex].get(inventoryItem.itemValue.inventory.bucketTypeHash);

                //Mark currently equipped item as unequipped
                let equippedItem = InventoryUtils.getEquippedItemFromBucket(srcBucket);
                if (equippedItem != null)
                    equippedItem.transferStatus = 0;

                //Mark target item as equipped
                inventoryItem.transferStatus = 1;

                // Sort after we insert the new item
                InventoryUtils.sortBucketItems(srcBucket);
                return response;
            }).catch((tranferResult: InventoryItemTransferResult) => {
                this.sharedApp.showError("Error when equipping " + inventoryItem.itemValue.displayProperties.name + ": " + tranferResult.Message);
            });
        }
        catch (error) {
            error.extraData1 = this._accountSummary;
            error.extraData2 = inventoryItem.characterIndex;
            this.sharedApp.showError("Error when equipping item " + inventoryItem.itemValue.displayProperties.name, error);
        }
    }

    /*  private equipItems(membership: DestinyMembership, characterId: string, itemIds: Array<number>): Promise<InventoryItemTransferResult> {
        let requestUrl = "https://www.bungie.net/Platform/Destiny2/EquipItem/";
        let body = {            characterId: characterId,            membershipType: membership.membershipType,            itemIds: itemIds        };
        return this.http.postBungie(requestUrl, body);
    }*/
} 