import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { ComponentTypes } from 'app/bungie/services/enums.interface';

import { DestinyMembership, BasicProfile } from '../../interface.barrel'

/** This Injectable manages the data layer for Destiny. This handles caching automatically.*/
@Injectable()
export class BasicProfileService {

    constructor(private http: HttpService) {
    }

    getBasicProfile(membership: DestinyMembership): Promise<BasicProfile> {
        let requestUrl = "https://www.bungie.net/Platform/Destiny2/" + membership.membershipType + "/Profile/" + membership.membershipId + "/?components=" + ComponentTypes.Profiles;

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, 0);
    }
}