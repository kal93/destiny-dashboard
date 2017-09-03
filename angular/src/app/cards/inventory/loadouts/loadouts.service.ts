import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { Loadout, ILoadoutResponse } from './loadouts.interface'
import { InventoryItem } from 'app/bungie/services/interface.barrel';

@Injectable()
export class LoadoutsService {
    constructor(protected http: HttpService) { }

    getUserLoadouts(membershipId: string, inventoryItemHashMap: Map<string, InventoryItem>): Promise<Array<Loadout>> {
        // return this.http.getWithCache("api/dashboard/userLoadouts", HttpRequestType.DASHBOARD, 120000);
        let loadoutsResponse: Array<ILoadoutResponse> = JSON.parse(localStorage.getItem("loadouts"));
        if (!loadoutsResponse)
            loadoutsResponse = [];

        // Assign loadouts their actual inventory item from the inventoryItem.itemId field
        let userLoadouts = new Array<Loadout>();
        for (let i = 0; i < loadoutsResponse.length; i++) {
            let loadoutResponse = loadoutsResponse[i];
            let loadout: Loadout = { name: loadoutResponse.name, inventoryItems: new Array<InventoryItem>() };

            for (let j = 0; j < loadoutResponse.itemIds.length; j++) {
                let inventoryItem = inventoryItemHashMap.get(loadoutResponse.itemIds[j]);
                // Remove the inventoryItem if the user doesn't have it any more
                if (inventoryItem != null)
                    loadout.inventoryItems.push(inventoryItem);
            }
            userLoadouts.push(loadout);
        }

        return Promise.resolve(userLoadouts);
    }

    saveUserLoadouts(userLoadouts: Array<Loadout>) {
        let loadoutsResponse = new Array<ILoadoutResponse>();
        userLoadouts.forEach((loadout) => {
            let loadoutResponse: ILoadoutResponse = { name: loadout.name, itemIds: [] }
            loadout.inventoryItems.forEach((inventoryItem) => {
                loadoutResponse.itemIds.push(inventoryItem.itemId);
            });

            loadoutsResponse.push(loadoutResponse);
        });

        // Only save itemId, not full inventoryItem
        localStorage.setItem("loadouts", JSON.stringify(loadoutsResponse));
    }
}