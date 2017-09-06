import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { SharedBungie } from 'app/bungie/shared-bungie.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { ComponentTypes } from 'app/bungie/services/enums.interface';

import { DestinyMembership, ICharacterProgression, ProgressionBase } from '../../interface.barrel'

/** This Injectable manages the data layer for Destiny Character Stats*/
@Injectable()
export class CharacterProgressionService {
    private cacheTimeMs: number = 60000;

    constructor(protected http: HttpService, private manifestService: ManifestService, private sharedApp: SharedApp, private sharedBungie: SharedBungie) { }

    getCharacterProgression(membership: DestinyMembership, characterId: string): Promise<ICharacterProgression> {
        // Build the request URL
        let requestUrl = "https://www.bungie.net/Platform/Destiny2/" + membership.membershipType + "/Profile/" + membership.membershipId + "/Character/" + characterId +
            "/?components=" + ComponentTypes.CharacterProgressions;

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, this.cacheTimeMs).then((characterProgressions: ICharacterProgression) => {
            characterProgressions.progressionsData = new Array<ProgressionBase>();

            //Create a map for the relationship from DestinyFactionDefinition to DestinyProgressDefinition
            let progressionHashFactionMap = new Map<number, any>();
            let factionMap = this.manifestService.getTableMap("DestinyFactionDefinition");
            factionMap.forEach((value, key) => {
                if (value.progressionHash != 0)
                    progressionHashFactionMap.set(value.progressionHash, value);
            });

            //Populate characterData with data from assoc array
            if (characterProgressions.progressions.data != null) {
                Object.keys(characterProgressions.progressions.data).forEach((key: string, index: number) => {
                    var progression: ProgressionBase = characterProgressions.progressions.data[key];
                    progression.progressionValue = this.manifestService.getManifestEntry("DestinyProgressionDefinition", progression.progressionHash);

                    let factionValue = progressionHashFactionMap.get(progression.progressionHash);
                    // Set the faction if it exists
                    if (factionValue != null) {
                        progression.factionValue = factionValue;
                        //progression.progressionValue = this.manifestService.getManifestEntry("DestinyProgressionDefinition", progression.progressionHash);
                    }

                    characterProgressions.progressionsData[index] = progression;
                });
            }

            return characterProgressions;
        }).catch((error) => {
           // this.sharedApp.showError("There was an error getting character reputation! Please try again.", error);
            return null;
        });;
    }
} 