import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { ComponentTypes } from 'app/bungie/services/enums.interface';

import { DestinyMembership, ICharacterInventorySummary } from '../../interface.barrel'

@Injectable()
export class CharacterInventorySummaryService {
    //Very low inventory cache... Don't really want to cache this but if multiple cards are requesting this endpoint at the same time let's cache it
    private cacheTimeMs: number = 100;

    constructor(protected http: HttpService, private sharedApp: SharedApp) { }

    getCharacterInventorySummary(membership: DestinyMembership, characterId: string): Promise<ICharacterInventorySummary> {
        let components = [
            //ComponentTypes.Profiles,
            //ComponentTypes.ProfileInventories,
            //ComponentTypes.ProfileCurrencies,
            //ComponentTypes.Characters,
            ComponentTypes.CharacterInventories,
            // ComponentTypes.CharacterProgressions,
            // ComponentTypes.CharacterActivities,
            ComponentTypes.CharacterEquipment,
            //ComponentTypes.ItemInstances,
            //ComponentTypes.ItemObjectives,
            //ComponentTypes.ItemPerks,
            //ComponentTypes.ItemSockets,
            //ComponentTypes.ItemTalentGrids,
            //ComponentTypes.ItemCommonData,
            //ComponentTypes.ItemPlugStates
        ];


        let requestUrl = "https://www.bungie.net/Platform/Destiny2/" + membership.membershipType + "/Profile/" + membership.membershipId + "/Character/" + characterId +
            "/?components=" + components.join(",");

        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_PRIVILEGED, this.cacheTimeMs);
    }
}

/*    getCharacterInventorySummary(membership: DestinyMembership, characterId: string): Promise<ICharacterInventorySummary> {
        let components = [ComponentTypes.Profiles,
        ComponentTypes.ProfileInventories,
        ComponentTypes.ProfileCurrencies,
        ComponentTypes.Characters,
        ComponentTypes.CharacterInventories,
        ComponentTypes.CharacterProgressions,
        ComponentTypes.CharacterActivities,
        ComponentTypes.CharacterEquipment,
        ComponentTypes.ItemInstances,
        ComponentTypes.ItemObjectives,
        ComponentTypes.ItemPerks,
        ComponentTypes.ItemSockets,
        ComponentTypes.ItemTalentGrids,
        ComponentTypes.ItemCommonData,
        ComponentTypes.ItemPlugStates];

        let requestUrl = "https://www.bungie.net/Platform/Destiny2/" + membership.membershipType + "/Profile/" + membership.membershipId + "/?components=" + components.join(",");

        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_PRIVILEGED, this.cacheTimeMs);
    }

*/