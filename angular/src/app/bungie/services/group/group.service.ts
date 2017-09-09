import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';

import { GroupV2GroupTypes } from 'app/bungie/services/enums.interface';
import { DestinyMembership, IGroupV2, IGroupV2User } from 'app/bungie/services/interface.barrel'

/** This Injectable manages the data layer for Destiny. This handles caching automatically.*/
@Injectable()
export class DestinyGroupService {
  private cacheTimeMs: number = 60000;

    constructor(private http: HttpService) {
    }

    getGroupV2(groupId: number): Promise<IGroupV2> {
        let requestUrl = "https://www.bungie.net/Platform/Groupv2/" + groupId + "/";

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, this.cacheTimeMs);
    }

    getGroupV2User(membership: DestinyMembership, groupFilter = 0, groupType: GroupV2GroupTypes): Promise<IGroupV2User> {
        let requestUrl = "https://www.bungie.net/Platform/GroupV2/User/" + membership.membershipType + "/" + membership.membershipId + "/" + groupFilter + "/" + groupType + "/";

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, this.cacheTimeMs);
    }
}