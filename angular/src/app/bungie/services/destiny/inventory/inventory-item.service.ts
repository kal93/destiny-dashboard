import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/services/http.service';
import { SharedBungie } from 'app/bungie/shared-bungie.service';

import { DestinyMembership } from '../../interface.barrel';
import { IAccountSummary, InventoryItem, InventoryBucket, InventoryTransferResult, SummaryCharacter } from 'app/bungie/services/interface.barrel';


@Injectable()
export class InventoryItemService {
    constructor(protected http: HttpService, private sharedBungie: SharedBungie) { }

    transferItems(selectedMembership: DestinyMembership, accountSummary: IAccountSummary, selectedInventoryItems: Array<InventoryItem>, destCharacterIndex: number, count: number): Promise<Array<Array<InventoryTransferResult>>> {
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
                    transferPromise = this.transferItemCharacterToCharacter(selectedMembership, inventoryItem, accountSummary.characters[inventoryItem.characterIndex],
                        accountSummary.characters[destCharacterIndex], count);
                else if (destCharacterIndex == 3)
                    // Character to vault
                    transferPromise = this.transferItemCharacterToVault(selectedMembership, inventoryItem, accountSummary.characters[inventoryItem.characterIndex], count);
                else if (inventoryItem.characterIndex == 3)
                    // Vault to character
                    transferPromise = this.transferItemVaultToCharacter(selectedMembership, inventoryItem, accountSummary.characters[destCharacterIndex], count);
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

    transferItemCharacterToCharacter(selectedMembership: DestinyMembership, inventoryItem: InventoryItem, srcCharacter: SummaryCharacter, destCharacter: SummaryCharacter, count: number): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.transferItemCharacterToVault(selectedMembership, inventoryItem, srcCharacter, count).then(() => {
                this.transferItemVaultToCharacter(selectedMembership, inventoryItem, destCharacter, count).then((response) => {
                    resolve(response);
                }).catch((error) => {
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });
        });
    }

    transferItemCharacterToVault(selectedMembership: DestinyMembership, inventoryItem: InventoryItem, srcCharacter: SummaryCharacter, count: number): Promise<any> {
        return this.transferItem(selectedMembership, srcCharacter.characterBase.characterId, inventoryItem, count, true);
    }
    transferItemVaultToCharacter(selectedMembership: DestinyMembership, inventoryItem: InventoryItem, destCharacter: SummaryCharacter, count: number): Promise<any> {
        return this.transferItem(selectedMembership, destCharacter.characterBase.characterId, inventoryItem, count, false);
    }

    private equipItem(membership: DestinyMembership, characterId: string, itemId: number): Promise<InventoryTransferResult> {
        let requestUrl = "https://www.bungie.net/d1/Platform/Destiny/EquipItem/";

        let body = {
            membershipType: membership.membershipType,
            itemId: itemId,
            characterId: characterId
        };

        return this.http.postBungie(requestUrl, body);
    }

    private equipItems(membership: DestinyMembership, characterId: string, itemIds: Array<number>): Promise<InventoryTransferResult> {
        let requestUrl = "https://www.bungie.net/d1/Platform/Destiny/EquipItem/";

        let body = {
            characterId: characterId,
            membershipType: membership.membershipType,
            itemIds: itemIds
        };

        return this.http.postBungie(requestUrl, body);
    }

    private transferItem(membership: DestinyMembership, targetCharacterId: string, inventoryItem: InventoryItem, count: number, toVault: boolean): Promise<InventoryTransferResult> {
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
        return this.http.postBungie(requestUrl, body);
    }
} 