import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { ModeTypes } from 'app/bungie/services/enums.interface';

import { BungieAccountClan, IClanLeaderboardsStats } from 'app/bungie/services/interface.barrel';

@Injectable()
export class DestinyStatsService {

    constructor(protected http: HttpService, private manifestService: ManifestService, private sharedApp: SharedApp) { }

    getClanleaderboardStats(clan: BungieAccountClan, modes: Array<ModeTypes>, maxTop = 4, statId?: string): Promise<IClanLeaderboardsStats> {
        let statIdParam = (statId == null) ? "" : "&statid=" + statId;

        let requestUrl = "https://www.bungie.net/Platform/Destiny2/Stats/ClanLeaderboards/" + clan.groupId + "/?maxtop=" + maxTop +
            "&modes=" + modes.join() + statIdParam;

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, 60000);
    }
} 