import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { SharedBungie } from 'app/bungie/shared-bungie.service';

import { DestinyMembership, IAccountSummary, INews } from '../../interface.barrel'

/** This Injectable manages the data layer for Destiny. This handles caching automatically.*/
@Injectable()
export class AccountSummaryService {
    private cacheTimeMs: number = 120000;

    constructor(private http: HttpService, private sharedApp: SharedApp, private sharedBungie: SharedBungie) {
    }

    getAccountSummary(membership: DestinyMembership): Promise<IAccountSummary> {
        let requestUrl = "https://www.bungie.net/d1/Platform/Destiny/" + membership.membershipType + "/Account/" + membership.membershipId + "/Summary/";

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, this.cacheTimeMs).then(response => response.data);
    }
}