import { Injectable } from '@angular/core';
import { HttpService } from 'app/shared/services/http.service';
import { SharedBungie } from 'app/bungie/shared-bungie.service';

import { DestinyMembership } from '../../interface.barrel';
import { InventoryItem, InventoryTransferResult } from './inventory-item.interface'

@Injectable()
export class InventoryItemService {
    constructor(protected http: HttpService, private sharedBungie: SharedBungie) { }

    equipItem(membership: DestinyMembership, characterId: string, itemId: number): Promise<InventoryTransferResult> {
        let requestUrl = "https://www.bungie.net/Platform/Destiny/EquipItem/";

        var body = {
            membershipType: membership.membershipType,
            itemId: itemId,
            characterId: characterId
        };

        return this.http.postBungie(requestUrl, body).then(response => response.data);
    }

    equipItems(membership: DestinyMembership, characterId: string, itemIds: Array<number>): Promise<InventoryTransferResult> {
        let requestUrl = "https://www.bungie.net/Platform/Destiny/EquipItem/";

        var body = {
            characterId: characterId,
            membershipType: membership.membershipType,
            itemIds: itemIds
        };

        return this.http.postBungie(requestUrl, body).then(response => response.data);
    }

    transferItem(membership: DestinyMembership, targetCharacterId: string, inventoryItem: InventoryItem, count: number, toVault: boolean): Promise<InventoryTransferResult> {
        // Build the request URL
        let requestUrl = "https://www.bungie.net/Platform/Destiny/TransferItem/";

        var body = {
            membershipType: membership.membershipType,
            itemReferenceHash: inventoryItem.itemHash,
            itemId: inventoryItem.itemId,
            stackSize: count,
            transferToVault: toVault,
            characterId: targetCharacterId
        };

        //Get the response, or return the cached result
        return this.http.postBungie(requestUrl, body).then(response => response.data);
    }
} 