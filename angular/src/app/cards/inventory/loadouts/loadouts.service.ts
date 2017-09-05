import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { Loadout, ILoadoutResponse } from './loadouts.interface'
import { IAccountSummary, InventoryItem } from 'app/bungie/services/interface.barrel';

@Injectable()
export class LoadoutsService {
    constructor(protected http: HttpService, private sharedApp: SharedApp) { }

    getUserLoadouts(accountSummary: IAccountSummary, inventoryItemHashMap: Map<string, InventoryItem>): Promise<Array<Loadout>> {

        return this.http.getWithCache("api/dashboard/userLoadouts?type=" + accountSummary.membershipType, HttpRequestType.DASHBOARD, 30000).then((loadoutsResponse: Array<ILoadoutResponse>) => {
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

            return userLoadouts;
        }).catch((error) => {
            this.sharedApp.showError("There was an error loading loadouts.", error);
            return null;
        });
    }

    saveUserLoadouts(accountSummary: IAccountSummary, userLoadouts: Array<Loadout>) {
        let loadoutsResponse = new Array<ILoadoutResponse>();
        userLoadouts.forEach((loadout) => {
            let loadoutResponse: ILoadoutResponse = { name: loadout.name, itemIds: [] }
            loadout.inventoryItems.forEach((inventoryItem) => {
                loadoutResponse.itemIds.push(inventoryItem.itemId);
            });

            loadoutsResponse.push(loadoutResponse);
        });

        //When we save, invalidate the cache
        this.http.invalidateCache("api/dashboard/userLoadouts?type=" + accountSummary.membershipType);

        return this.http.postDashboard("api/dashboard/userLoadouts?type=" + accountSummary.membershipType, loadoutsResponse).catch((error) => {
            this.sharedApp.showError("There was an error when trying to save loadouts. Please try again.", error);
            throw (error);
        });
    }
}