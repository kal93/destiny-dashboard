import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { SharedBungie } from 'app/bungie/shared-bungie.service';

import { DestinyMembership, ICharacterInventory } from '../../interface.barrel'

@Injectable()
export class CharacterInventoryService {
    //Very low inventory cache... Don't really want to cache this but if multiple cards are requesting this endpoint at the same time let's cache it
    private cacheTimeMs: number = 100;

    constructor(protected http: HttpService, private sharedApp: SharedApp, private sharedBungie: SharedBungie) { }

    getCharacterInventory(membership: DestinyMembership, characterId: string): Promise<ICharacterInventory> {
        // Build the request URL
        let requestUrl = "https://www.bungie.net/Platform/Destiny/" + membership.membershipType + "/Account/" + membership.membershipId + "/Character/" + characterId +
            "/Inventory/";

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_PRIVILEGED, this.cacheTimeMs).then(response => response.data);
    }
} 