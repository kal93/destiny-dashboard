import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { SharedBungie } from 'app/bungie/shared-bungie.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { ComponentTypes } from 'app/bungie/services/enums.interface';

import { DestinyMembership, ICharacterProgression, FactionBase, ProgressionBase, MilestoneBase } from '../../interface.barrel'

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
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_PRIVILEGED, this.cacheTimeMs).then((characterProgressions: ICharacterProgression) => {
            let progressionWrapper = characterProgressions.progressions.data;

            characterProgressions.progressionData = new Array<ProgressionBase>();
            characterProgressions.factionData = new Array<FactionBase>();
            characterProgressions.milestoneData = new Array<MilestoneBase>();

            if (progressionWrapper != null) {
                // Populate factions data
                Object.keys(progressionWrapper.factions).forEach((key: string, index: number) => {
                    var faction: FactionBase = progressionWrapper.factions[key];
                    faction.factionValue = this.manifestService.getManifestEntry("DestinyFactionDefinition", faction.factionHash);

                    if (faction.factionValue != null)
                        characterProgressions.factionData.push(faction);
                });

                // Populate milestones data
                Object.keys(progressionWrapper.milestones).forEach((key: string, index: number) => {
                    var milestone: MilestoneBase = progressionWrapper.milestones[key];
                    milestone.milestoneValue = this.manifestService.getManifestEntry("DestinyMilestoneDefinition", milestone.milestoneHash);

                    if (milestone.milestoneValue != null)
                        characterProgressions.milestoneData.push(milestone);
                });

                //Populate progressions data
                Object.keys(progressionWrapper.progressions).forEach((key: string, index: number) => {
                    var progression: ProgressionBase = progressionWrapper.progressions[key];
                    progression.progressionValue = this.manifestService.getManifestEntry("DestinyProgressionDefinition", progression.progressionHash);

                    if (progression.progressionValue != null)
                        characterProgressions.progressionData.push(progression);
                });
            }

            return characterProgressions;
        });
    }
} 