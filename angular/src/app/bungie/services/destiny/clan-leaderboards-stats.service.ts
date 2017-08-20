import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from '../../../shared/services/http.service';
import { SharedApp } from '../../../shared/services/shared-app.service';
import { SharedBungie } from '../../shared-bungie.service';

import { IClanLeaderboardsStats, BungieAccountClan } from '../interface.barrel'
import { ModeTypes } from '../enums.interface';

/* Endpoint notes:

At this time the endpoint requires maxtop to be present but ignores the value and returns 4 results,
which is why I've set the default to 4 for now.

The statid parameter will only return results with these strings (other strings will return without error but with no results).
Also not all ModeTypes have lbSingleGameScore so it is possible to use this valid string and get no results.
    lbSingleGameKills
    lbSingleGameScore
    lbMostPrecisionKills
    lbLongestKillSpree
    lbLongestSingleLife
*/

/** This Injectable manages the data layer for Destiny Accounts.*/
@Injectable()
export class ClanLeaderboardsStatsService {
    private cacheTimeMs: number = 60000;

    constructor(private http: HttpService, private sharedApp: SharedApp, private sharedBungie: SharedBungie) {
    }

    getClanleaderboardStats(clan: BungieAccountClan, modes: Array<ModeTypes>, maxtop = 4, statid?: string): Promise<IClanLeaderboardsStats> {
        
        if ( statid == undefined ) {
            var requestUrl = "https://www.bungie.net/D1/Platform/Destiny/Stats/ClanLeaderboards/" + clan.groupId + "/?maxtop=" + maxtop +
            "&modes=" + modes.join();
        } else {
            var requestUrl = "https://www.bungie.net/D1/Platform/Destiny/Stats/ClanLeaderboards/" + clan.groupId + "/?maxtop=" + maxtop +
            "&modes=" + modes.join() + "&statid=" + statid;
        }
        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, this.cacheTimeMs);
    }
}
