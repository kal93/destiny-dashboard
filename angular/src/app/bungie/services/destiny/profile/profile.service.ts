import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { ComponentTypes } from 'app/bungie/services/enums.interface';

import { ProfileBasic, CharacterBase, IAccountSummary } from './';

import { DestinyMembership, ICharacterProgression, IProfileSummary, FactionBase, ProgressionBase, MilestoneBase } from 'app/bungie/services/interface.barrel';

@Injectable()
export class DestinyProfileService {

    constructor(protected http: HttpService, private manifestService: ManifestService, private sharedApp: SharedApp) { }

    private getDestinyProfileResponse(membership: DestinyMembership, components: Array<ComponentTypes>, httpRequestType: HttpRequestType, cacheTimeMs: number = 0) {
        let requestUrl = "https://www.bungie.net/Platform/Destiny2/" + membership.membershipType + "/Profile/" + membership.membershipId + "/?components=" + components.join(",");

        return this.http.getWithCache(requestUrl, httpRequestType, cacheTimeMs);
    }

    private getDestinyProfileCharacterResponse(membership: DestinyMembership, characterId: string, components: Array<ComponentTypes>, httpRequestType: HttpRequestType, cacheTimeMs: number = 0) {
        let requestUrl = "https://www.bungie.net/Platform/Destiny2/" + membership.membershipType + "/Profile/" + membership.membershipId + "/Character/" + characterId +
            "/?components=" + ComponentTypes.CharacterProgressions;

        return this.http.getWithCache(requestUrl, httpRequestType, cacheTimeMs);
    }

    getBasicProfile(membership: DestinyMembership): Promise<ProfileBasic> {
        return this.getDestinyProfileResponse(membership, [ComponentTypes.Profiles], HttpRequestType.BUNGIE_BASIC);
    }

    getAccountSummary(membership: DestinyMembership): Promise<IAccountSummary> {
        return this.getDestinyProfileResponse(membership, [ComponentTypes.Characters], HttpRequestType.BUNGIE_BASIC, 120000).then((accountSummary: IAccountSummary) => {
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
        });
    }

    getCharacterProgression(membership: DestinyMembership, characterId: string): Promise<ICharacterProgression> {
        return this.getDestinyProfileCharacterResponse(membership, characterId, [ComponentTypes.CharacterProgressions], HttpRequestType.BUNGIE_PRIVILEGED, 30000).then((characterProgressions: ICharacterProgression) => {
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

    getProfileSummary(membership: DestinyMembership): Promise<IProfileSummary> {
        return this.getDestinyProfileResponse(membership, [ComponentTypes.ProfileInventories, ComponentTypes.ProfileCurrencies], HttpRequestType.BUNGIE_PRIVILEGED);
    }

} 