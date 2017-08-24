import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { SharedBungie } from 'app/bungie/shared-bungie.service';

import { DestinyMembership, IGetBungieAccount } from '../interface.barrel'

/** This Injectable manages the data layer for Destiny Accounts.*/
@Injectable()
export class GetBungieAccountService {
    private cacheTimeMs: number = 60000;

    constructor(private http: HttpService, private sharedApp: SharedApp, private sharedBungie: SharedBungie) {
    }

    getBungieAccount(membership: DestinyMembership): Promise<IGetBungieAccount> {
        let requestUrl = "https://www.bungie.net/Platform/User/GetBungieAccount/" + membership.membershipId + "/" + membership.membershipType + "/";
        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, this.cacheTimeMs);
    }
}
