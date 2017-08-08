import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from '../../../shared/services/http.service';
import { SharedApp } from '../../../shared/services/shared-app.service';
import { SharedBungie } from '../../shared-bungie.service';

import { DestinyMembership, IAccountStats, INews } from '../interface.barrel'
import { GroupTypes } from '../enums.interface';

/** This Injectable manages the data layer for Destiny Accounts.*/
@Injectable()
export class AccountStatsService {
    private cacheTimeMs: number = 30000;

    constructor(private http: HttpService, private sharedApp: SharedApp, private sharedBungie: SharedBungie) {
    }

    getAccountStats(membership: DestinyMembership, groups: Array<GroupTypes>): Promise<IAccountStats> {
        var requestUrl = "https://www.bungie.net/d1/Platform/Destiny/Stats/Account/" + membership.membershipType + "/" + membership.membershipId +
            "/?groups=" + groups.join();

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, this.cacheTimeMs);
    }
}