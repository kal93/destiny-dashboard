import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { ComponentTypes } from 'app/bungie/services/enums.interface';

import { GroupTypes, ModeTypes, PeriodTypes, TimeSpan } from '../../enums.interface';

import {
    CharacterBase, DestinyMembership, IAccountStats, IAccountSummary, ICharacterInventorySummary, ICharacterProgression, ICharacterStats, IProfileSummary,
    FactionBase, ProfileBasic, ProgressionBase, MilestoneBase
} from 'app/bungie/services/interface.barrel';

@Injectable()
export class DestinyAccountService {

    constructor(protected http: HttpService, private manifestService: ManifestService, private sharedApp: SharedApp) { }

    getAccountStats(membership: DestinyMembership, groups: Array<GroupTypes>): Promise<IAccountStats> {
        let requestUrl = "https://www.bungie.net/Platform/Destiny2/" + membership.membershipType + "/Account/" + membership.membershipId +
            "/Stats/?groups=" + groups.join();

        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, TimeSpan.MINUTES_1);
    }

    getCharacterStats(membership: DestinyMembership, characterId: string, groups: Array<GroupTypes>, modes: Array<ModeTypes>, period: PeriodTypes): Promise<ICharacterStats> {
        let requestUrl = "https://www.bungie.net/Platform/Destiny2/" + membership.membershipType + "/Account/" + membership.membershipId + "/Character/" + characterId +
            "/Stats/?periodType=" + period + "&modes=" + modes.join() + "&groups=" + groups.join();

        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, TimeSpan.MINUTES_1);
    }

} 