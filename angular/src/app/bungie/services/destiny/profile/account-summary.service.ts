import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { SharedBungie } from 'app/bungie/shared-bungie.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { ComponentTypes } from 'app/bungie/services/enums.interface';

import { CharacterBase, DestinyMembership, IAccountSummary, INews } from '../../interface.barrel'

/** This Injectable manages the data layer for Destiny. This handles caching automatically.*/
@Injectable()
export class AccountSummaryService {
    private cacheTimeMs: number = 120000;

    constructor(private http: HttpService, private manifestService: ManifestService, private sharedApp: SharedApp, private sharedBungie: SharedBungie) {
    }

    getAccountSummary(membership: DestinyMembership): Promise<IAccountSummary> {
        let requestUrl = "https://www.bungie.net/Platform/Destiny2/" + membership.membershipType + "/Profile/" + membership.membershipId + "/?components=" + ComponentTypes.Characters;

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, this.cacheTimeMs).then((accountSummary: IAccountSummary) => {
            accountSummary.characterData = new Array<CharacterBase>();

            //Populate characterData with data from assoc array
            Object.keys(accountSummary.characters.data).forEach((key: string, index: number) => {
                var character: CharacterBase = accountSummary.characters.data[key];

                character.classValue = this.manifestService.getManifestEntry("DestinyClassDefinition", character.classHash);
                character.genderValue = this.manifestService.getManifestEntry("DestinyGenderDefinition", character.genderHash);
                character.raceValue = this.manifestService.getManifestEntry("DestinyRaceDefinition", character.raceHash);

                accountSummary.characterData[index] = character;
            });

            return accountSummary;
        }).catch((error) => {
           // this.sharedApp.showError("There was an error getting account data! Please try again.", error);
            return null;
        });
    }
}