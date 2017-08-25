import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/services/http.service';
import { SharedBungie } from 'app/bungie/shared-bungie.service';
import { SharedApp } from 'app/shared/services/shared-app.service';

import { DestinyMembership } from 'app/bungie/services/interface.barrel';
import { IAccountSummary, InventoryItem, InventoryBucket, InventoryItemTransferResult, SummaryCharacter } from 'app/bungie/services/interface.barrel';


@Injectable()
export class InventoryItemService {
    private _bucketsMap: Array<Map<number, InventoryBucket>>;
    private _selectedMembership: DestinyMembership;
    private _accountSummary: IAccountSummary;

    // Tally up the successes and failure
    private _transferSuccesses: Array<InventoryItemTransferResult>;
    private _transferFailures: Array<InventoryItemTransferResult>;

    constructor(protected http: HttpService, public sharedApp: SharedApp, private sharedBungie: SharedBungie) { }

    transferItems(bucketsMap: Array<Map<number, InventoryBucket>>, selectedMembership: DestinyMembership, accountSummary: IAccountSummary, inventoryItems: Array<InventoryItem>, destCharacterIndex: number, count: number): Promise<Array<Array<InventoryItemTransferResult>>> {
        this._bucketsMap = bucketsMap;
        this._selectedMembership = selectedMembership;
        this._accountSummary = accountSummary;

        this._transferSuccesses = new Array<InventoryItemTransferResult>();
        this._transferFailures = new Array<InventoryItemTransferResult>();

        return new Promise<Array<Array<InventoryItemTransferResult>>>((resolve, reject) => {
            let transferPromises = Array<Promise<any>>();

            for (let i = 0; i < inventoryItems.length; i++) {
                let inventoryItem = inventoryItems[i];

                // Don't transfer things that already exist in their destination
                if (inventoryItem.characterIndex == destCharacterIndex)
                    continue;

                let transferPromise;
                if (destCharacterIndex < 3 && inventoryItem.characterIndex < 3)
                    // Character to character transfer
                    transferPromise = this.transferItemCharacterToCharacter(inventoryItem, destCharacterIndex, count);
                else if (destCharacterIndex == 3)
                    // Character to vault
                    transferPromise = this.transferItemCharacterToVault(inventoryItem, count);
                else if (inventoryItem.characterIndex == 3)
                    // Vault to character
                    transferPromise = this.transferItemVaultToCharacter(inventoryItem, destCharacterIndex, count);
                else
                    console.error("Unknown index for transfer");

                transferPromises.push(transferPromise);
            }

            Promise.all(transferPromises).then(() => {
                resolve([this._transferSuccesses, this._transferFailures]);
            });
        });
    }

    transferItemCharacterToCharacter(inventoryItem: InventoryItem, destCharacterIndex: number, count: number): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.transferItemCharacterToVault(inventoryItem, count).then(() => {
                this.transferItemVaultToCharacter(inventoryItem, destCharacterIndex, count).then((response) => {
                    resolve(response);
                }).catch((error) => {
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });
        });
    }

    transferItemCharacterToVault(inventoryItem: InventoryItem, count: number): Promise<any> {
        let srcCharacter = this._accountSummary.characters[inventoryItem.characterIndex];
        // Make sure the vault can handle whatever we're trying to transfer
        return this.transferItem(this._selectedMembership, srcCharacter.characterBase.characterId, 3, inventoryItem, count, true);
    }

    transferItemVaultToCharacter(inventoryItem: InventoryItem, destCharacterIndex: number, count: number): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            // Make sure destination character inventory has room to transfer
            let destBucket = this._bucketsMap[destCharacterIndex].get(inventoryItem.itemValue.bucketTypeHash);
            let destCharacter = this._accountSummary.characters[destCharacterIndex];

            // If the destination bucket is full, transfer out the lowest value item (Full stack if possible)
            if (this.isBucketFull(destBucket)) {
                let lowestValueItem = this.getUnequippedLowestValueItemFromBucket(destBucket);
                this.transferItemCharacterToVault(lowestValueItem, lowestValueItem.quantity).then(() => {
                    this.sharedApp.showInfo("Destination was full, transferred " + lowestValueItem.itemValue.itemName + " to your vault to make room", { timeOut: 3000 });
                    resolve(this.transferItem(this._selectedMembership, destCharacter.characterBase.characterId, destCharacterIndex, inventoryItem, count, false));
                }).catch((error) => {
                    reject(error);
                });
            }
            else
                resolve(this.transferItem(this._selectedMembership, destCharacter.characterBase.characterId, destCharacterIndex, inventoryItem, count, false));
        });
    }

    isItemEquipped(inventoryItem: InventoryItem) {
        return inventoryItem.transferStatus % 2 == 1;
    }

    private isBucketFull(destBucket: InventoryBucket) {
        return destBucket.bucketValue.itemCount == destBucket.items.length;
    }

    private getUnequippedLowestValueItemFromBucket(destBucket: InventoryBucket): InventoryItem {
        var lowestValueItem: InventoryItem;
        for (let i = 0; i < destBucket.items.length; i++) {
            let inventoryItem = destBucket.items[i];
            if (this.isItemEquipped(inventoryItem))
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
                    if (inventoryItem.primaryStat.value < lowestValueItem.primaryStat.value)
                        lowestValueItem = inventoryItem;
                }
            }
        }
        return lowestValueItem;
    }

    private equipItem(membership: DestinyMembership, characterId: string, itemId: number): Promise<InventoryItemTransferResult> {
        let requestUrl = "https://www.bungie.net/d1/Platform/Destiny/EquipItem/";

        let body = {
            membershipType: membership.membershipType,
            itemId: itemId,
            characterId: characterId
        };

        return this.http.postBungie(requestUrl, body);
    }

    private equipItems(membership: DestinyMembership, characterId: string, itemIds: Array<number>): Promise<InventoryItemTransferResult> {
        let requestUrl = "https://www.bungie.net/d1/Platform/Destiny/EquipItem/";

        let body = {
            characterId: characterId,
            membershipType: membership.membershipType,
            itemIds: itemIds
        };

        return this.http.postBungie(requestUrl, body);
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
            tranferResult.inventoryItem = inventoryItem;
            tranferResult.destCharacterIndex = destCharacterIndex;
            this._transferSuccesses.push(tranferResult);
            return tranferResult;
        }).catch((tranferResult: InventoryItemTransferResult) => {
            tranferResult.inventoryItem = inventoryItem;
            tranferResult.destCharacterIndex = destCharacterIndex;
            this._transferFailures.push(tranferResult);
            return tranferResult;
        });
    }
} 