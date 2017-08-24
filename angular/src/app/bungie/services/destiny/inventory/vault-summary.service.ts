import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { SharedBungie } from 'app/bungie/shared-bungie.service';

import { DestinyMembership, IVaultSummary } from '../../interface.barrel'

@Injectable()
export class VaultSummaryService {
    //Very low inventory cache... Don't really want to cache this but if multiple cards are requesting this endpoint at the same time let's cache it
    private cacheTimeMs: number = 100;

    constructor(protected http: HttpService, private sharedApp: SharedApp, private sharedBungie: SharedBungie) { }

    getVaultSummary(membership: DestinyMembership): Promise<IVaultSummary> {
        // Build the request URL
        let requestUrl = "https://www.bungie.net/d1/Platform/Destiny/" + membership.membershipType + "/MyAccount/Vault/Summary/";

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_PRIVILEGED, this.cacheTimeMs).then(response => response.data);
    }
} 