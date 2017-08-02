import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from '../../shared/services/http.service';
import { SharedApp } from '../../shared/services/shared-app.service';
import { SharedBungie } from '../shared-bungie.service';

import { DestinyMembership } from '../../bungie/user/user.interface'
import { ICharacterProgression } from './character-progression.interface';

/** This Injectable manages the data layer for Destiny Character Stats*/
@Injectable()
export class CharacterProgressionService {
    private cacheTimeMs: number = 60000;

    constructor(protected http: HttpService, private sharedApp: SharedApp, private sharedBungie: SharedBungie) { }

    getCharacterProgression(membership: DestinyMembership, characterId: string): Promise<ICharacterProgression> {
        // Build the request URL
        var requestUrl = "https://www.bungie.net/d1/Platform/Destiny/" + membership.membershipType + "/Account/" + membership.membershipId + "/Character/" + characterId +
            "/Progression/";

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, this.cacheTimeMs).then(response => response.data);
    }
} 