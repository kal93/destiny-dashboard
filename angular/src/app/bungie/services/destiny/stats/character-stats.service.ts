import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { SharedBungie } from 'app/bungie/shared-bungie.service';

import { DestinyMembership, ICharacterStats } from '../../interface.barrel'
import { GroupTypes, ModeTypes, PeriodTypes } from '../../enums.interface';

/** This Injectable manages the data layer for Destiny Character Stats*/
@Injectable()
export class CharacterStatsService {
    private cacheTimeMs: number = 60000;

    constructor(protected http: HttpService, private sharedApp: SharedApp, private sharedBungie: SharedBungie) {
    }

    getCharacterStats(membership: DestinyMembership, characterId: string, groups: Array<GroupTypes>, modes: Array<ModeTypes>, period: PeriodTypes): Promise<ICharacterStats> {
        // Build the request URL
        let requestUrl = "https://www.bungie.net/d1/Platform/Destiny/Stats/" + membership.membershipType + "/" + membership.membershipId + "/" + characterId +
            "/?groups=" + groups.join() + "&modes=" + modes.join() + "&periodType=" + period;

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, this.cacheTimeMs);
    }
} 