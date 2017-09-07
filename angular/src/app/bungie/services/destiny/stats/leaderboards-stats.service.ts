import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';

import { CharacterBase, DestinyMembership } from '../../interface.barrel'
import { ModeTypes } from '../../enums.interface';

@Injectable()
export class LeaderboardsStatsService {
    private cacheTimeMs: number = 60000;

    constructor(private http: HttpService, private sharedApp: SharedApp) {
    }

    getClanleaderboardStats(membership: DestinyMembership, character: CharacterBase, modes: Array<ModeTypes>, maxTop = 4, statId?: string): Promise<any> {
        let statIdParam = (statId == null) ? "" : "&statid=" + statId;

        let requestUrl = "https://www.bungie.net/Platform/Destiny2/Stats/Leaderboards/" + membership.membershipType + "/" + membership.membershipId + "/" + character.characterId +
            "/?maxtop=" + maxTop + "&modes=" + modes.join() + statIdParam;

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, this.cacheTimeMs);
    }
}