import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from '../../../shared/services/http.service';
import { SharedApp } from '../../../shared/services/shared-app.service';
import { SharedBungie } from '../../shared-bungie.service';

import { DestinyMembership, IAccountSummary, INews } from '../interface.barrel'

import 'rxjs/add/operator/map';

/** This Injectable manages the data layer for Destiny. This handles caching automatically.*/
@Injectable()
export class AccountSummaryService {
    private cacheTimeMs: number = 60000;

    constructor(private http: HttpService, private sharedApp: SharedApp, private sharedBungie: SharedBungie) {
    }

    getAccountSummary(membership: DestinyMembership): Promise<IAccountSummary> {
        var requestUrl = "https://www.bungie.net/d1/Platform/Destiny/" + membership.membershipType + "/Account/" + membership.membershipId + "/Summary/";

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, this.cacheTimeMs).then(response => response.data);
    }
}