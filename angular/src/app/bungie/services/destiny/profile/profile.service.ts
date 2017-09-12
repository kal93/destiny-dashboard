import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { ComponentTypes, TimeSpan } from 'app/bungie/services/enums.interface';
import { PerkDefinition, QuestBase } from 'app/bungie/manifest/interfaces';

import {
    CharacterBase, DestinyMembership, IAccountSummary, ICharacterInventorySummary, ICharacterProgression, InventoryItem, IProfileSummary, MilestoneBase,
    FactionBase, ProfileBasic, ProgressionBase
} from 'app/bungie/services/interface.barrel';

@Injectable()
export class DestinyProfileService {
    factionTokenMap = new Map<number, Array<Array<number>>>();
    constructor(protected http: HttpService, private manifestService: ManifestService, private sharedApp: SharedApp) {
        // Map faction data to their token data manually since there's no database relationship        
        //                      FactionHash  [ItemHash, ItemRepValue]
        this.factionTokenMap.set(1021210278, [[685157381, 25], [685157383, 75]]); // Gunsmith  telemetry = 25, token = 75
        this.factionTokenMap.set(4235119312, [[2640973641, 50], [950899352, 100], [478751073, 200]]); // Dead Zone Scout
        this.factionTokenMap.set(611314723, [[3957264072, 50], [3899548068, 100]]); // Vanguard Tactical
        this.factionTokenMap.set(4196149087, [[494493680, 50]]); // Field Commander
        this.factionTokenMap.set(697030790, [[183980811, 100]]); // The Crucible token = 100
        this.factionTokenMap.set(1660497607, [[3201839676, 50], [3487922223, 50], [2949414982, 50]]); // Exodus Black AI
        this.factionTokenMap.set(828982195, [[3825769808, 50], [1305274547, 50], [3756389242, 50]]); // Fragmented Researcher
        this.factionTokenMap.set(3231773039, []); // Vanguard Researcher (Ikora Rey)
        // Dead Orbit token = 2959556799 | fwc token 1270564331 | nm 2270228604
    }

    private getDestinyProfileResponse(membership: DestinyMembership, components: Array<ComponentTypes>, httpRequestType: HttpRequestType, cacheTimeMs: number = 0): Promise<any> {
        let requestUrl = "https://www.bungie.net/Platform/Destiny2/" + membership.membershipType + "/Profile/" + membership.membershipId + "/?components=" + components.join(",");

        return this.http.getWithCache(requestUrl, httpRequestType, cacheTimeMs);
    }

    private getDestinyProfileCharacterResponse(membership: DestinyMembership, characterId: string, components: Array<ComponentTypes>, httpRequestType: HttpRequestType, cacheTimeMs: number = 0): Promise<any> {
        let requestUrl = "https://www.bungie.net/Platform/Destiny2/" + membership.membershipType + "/Profile/" + membership.membershipId + "/Character/" + characterId +
            "/?components=" + components.join();

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

    getCharacterInventorySummary(membership: DestinyMembership, characterId: string): Promise<ICharacterInventorySummary> {
        return this.getDestinyProfileCharacterResponse(membership, characterId,
            [ComponentTypes.CharacterInventories, ComponentTypes.CharacterEquipment, ComponentTypes.ItemInstances],
            HttpRequestType.BUNGIE_PRIVILEGED).then((response: ICharacterInventorySummary) => {
                // A map of the stats we asked for (ComponentTypes.ItemInstances)
                let statsMap = response.itemComponents.instances.data;

                let missingItemValue: boolean = false;
                // Populate inventory items with their item stat values
                for (let i = 0; i < response.inventory.data.items.length; i++) {
                    let inventoryItem = response.inventory.data.items[i];
                    // Assign inventory item hash

                    this.setInventoryItemDefinition(inventoryItem);

                    // If hash doesn't exist, remove inventoryItem completely and let use know later
                    if (inventoryItem.itemValue == null) {
                        missingItemValue = true;
                        response.inventory.data.items.splice(i, 1);
                        i--;
                    }

                    // Assign damage type if it exists
                    inventoryItem.itemComponentData = statsMap[inventoryItem.itemInstanceId];
                    if (inventoryItem.itemComponentData != null)
                        inventoryItem.itemComponentData.damageTypeValue = this.manifestService.getManifestEntry("DestinyDamageTypeDefinition", inventoryItem.itemComponentData.damageTypeHash);
                }

                for (let i = 0; i < response.equipment.data.items.length; i++) {
                    let inventoryItem = response.equipment.data.items[i];
                    this.setInventoryItemDefinition(inventoryItem);

                    if (inventoryItem.itemValue == null) {
                        missingItemValue = true;
                        response.equipment.data.items.splice(i, 1);
                        i--;
                    }

                    inventoryItem.itemComponentData = statsMap[inventoryItem.itemInstanceId];
                    if (inventoryItem.itemComponentData != null)
                        inventoryItem.itemComponentData.damageTypeValue = this.manifestService.getManifestEntry("DestinyDamageTypeDefinition", inventoryItem.itemComponentData.damageTypeHash);
                }

                if (missingItemValue)
                    this.sharedApp.showInfoOncePerSession("Some items in your inventory could not be loaded because they're missing from the Bungie database.");

                return response;
            });
    }

    getCharacterProgression(membership: DestinyMembership, characterId: string, getInventories: boolean = false): Promise<ICharacterProgression> {
        return new Promise<ICharacterProgression>((resolve, reject) => {
            let progressionPromises = [];
            if (getInventories)
                progressionPromises.push(this.getProfileSummary(membership));
            else
                progressionPromises.push(Promise.resolve());

            progressionPromises.push(this.getDestinyProfileCharacterResponse(membership, characterId, [ComponentTypes.CharacterProgressions],
                HttpRequestType.BUNGIE_PRIVILEGED, TimeSpan.MINUTES_1));

            Promise.all(progressionPromises).then((responses) => {
                let inventoryItemsMap = new Map<number, any>();
                // Get profile inventory items so we can show which faction items the user has
                if (getInventories) {
                    let profileSummaryResponse = responses[0];

                    // If profileSummaryResponse is null, we probably don't have access to the users inventory
                    if (profileSummaryResponse != null) {
                        let inventoryItems = profileSummaryResponse.profileInventory.data.items;
                        inventoryItems.forEach((inventoryItem) => {
                            inventoryItem.itemValue = this.manifestService.getManifestEntry("DestinyInventoryItemDefinition", inventoryItem.itemHash);
                            inventoryItemsMap.set(inventoryItem.itemHash, inventoryItem);
                        });
                    }
                }

                let characterProgressions: ICharacterProgression = responses[1];
                let progressionWrapper = characterProgressions.progressions.data;

                characterProgressions.progressionData = new Array<ProgressionBase>();
                characterProgressions.factionData = new Array<FactionBase>();
                characterProgressions.milestoneData = new Array<MilestoneBase>();

                if (progressionWrapper != null) {
                    // Populate factions data
                    Object.keys(progressionWrapper.factions).forEach((key: string, index: number) => {
                        var faction: FactionBase = progressionWrapper.factions[key];
                        faction.factionValue = this.manifestService.getManifestEntry("DestinyFactionDefinition", faction.factionHash);

                        if (inventoryItemsMap.size > 0) {
                            // Populate this faction with the tokens the current user has
                            faction.factionInventoryItems = new Array<InventoryItem>();
                            let factionInventoryItemData = this.factionTokenMap.get(faction.factionHash);
                            if (factionInventoryItemData != null)
                                factionInventoryItemData.forEach((factionInventoryItemHash) => {
                                    let factionInventoryItem = inventoryItemsMap.get(factionInventoryItemHash[0]);
                                    if (factionInventoryItem != null) {
                                        factionInventoryItem.repValue = factionInventoryItemHash[1];
                                        faction.factionInventoryItems.push(factionInventoryItem);
                                    }
                                });
                        }

                        if (faction.factionValue != null)
                            characterProgressions.factionData.push(faction);
                    });

                    // Populate milestones data
                    Object.keys(progressionWrapper.milestones).forEach((key: string, index: number) => {
                        var milestone: MilestoneBase = progressionWrapper.milestones[key];
                        milestone.milestoneValue = this.manifestService.getManifestEntry("DestinyMilestoneDefinition", milestone.milestoneHash);

                        if (milestone.milestoneValue != null) {
                            milestone.milestoneValue.questsData = new Array<QuestBase>();
                            // Populate quests array from map
                            Object.keys(milestone.milestoneValue.quests).forEach((key: string, index: number) => {
                                var quest: QuestBase = milestone.milestoneValue.quests[key];
                                if (quest != null)
                                    milestone.milestoneValue.questsData.push(quest);
                            });

                            characterProgressions.milestoneData.push(milestone);
                        }

                        // Populates availableQuests with questItemHashValue and questRewards
                        if (milestone.availableQuests != null) {
                            for (let i = 0; i < milestone.availableQuests.length; i++) {
                                let availableQuest = milestone.availableQuests[i];
                                availableQuest.questItemValue = this.manifestService.getManifestEntry("DestinyInventoryItemDefinition", availableQuest.questItemHash);

                                // Copy questRewards from milestone for easier lookup later
                                availableQuest.questRewards = milestone.milestoneValue.quests[availableQuest.questItemHash].questRewards;

                                if (availableQuest.activity != null)
                                    availableQuest.activityValue = this.manifestService.getManifestEntry("DestinyActivityDefinition", availableQuest.activity.activityHash);
                            }
                        }
                    });

                    //Populate progressions data
                    Object.keys(progressionWrapper.progressions).forEach((key: string, index: number) => {
                        var progression: ProgressionBase = progressionWrapper.progressions[key];
                        progression.progressionValue = this.manifestService.getManifestEntry("DestinyProgressionDefinition", progression.progressionHash);

                        if (progression.progressionValue != null)
                            characterProgressions.progressionData.push(progression);
                    });
                }
                resolve(characterProgressions);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    getProfileSummary(membership: DestinyMembership, cacheTimeMs: number = 0): Promise<IProfileSummary> {
        return this.getDestinyProfileResponse(membership, [ComponentTypes.ProfileInventories, ComponentTypes.ItemInstances], HttpRequestType.BUNGIE_PRIVILEGED, cacheTimeMs).then((response: IProfileSummary) => {
            if (response.itemComponents.instances == null || response.profileInventory == null)
                return null;
            if (response.profileInventory.data == null)
                return null;

            let statsMap = response.itemComponents.instances.data;

            let missingItemValue: boolean = false;
            for (let i = 0; i < response.profileInventory.data.items.length; i++) {
                let inventoryItem = response.profileInventory.data.items[i];
                this.setInventoryItemDefinition(inventoryItem);

                if (inventoryItem.itemValue == null) {
                    missingItemValue = true;
                    response.profileInventory.data.items.splice(i, 1);
                    i--;
                }
                inventoryItem.itemComponentData = statsMap[inventoryItem.itemInstanceId];
                if (inventoryItem.itemComponentData != null)
                    inventoryItem.itemComponentData.damageTypeValue = this.manifestService.getManifestEntry("DestinyDamageTypeDefinition", inventoryItem.itemComponentData.damageTypeHash);
            }

            if (missingItemValue)
                this.sharedApp.showWarning("Some items in your inventory could not be loaded because they're missing from the Bungie database.");

            return response;
        });
    }

    private setInventoryItemDefinition(inventoryItem: InventoryItem) {
        inventoryItem.itemValue = this.manifestService.getManifestEntry("DestinyInventoryItemDefinition", inventoryItem.itemHash);
        if (inventoryItem.itemValue == null)
            return;

        inventoryItem.itemValue.perksData = new Array<PerkDefinition>();
        if (inventoryItem.itemValue.perks != null) {
            inventoryItem.itemValue.perks.forEach((perk) => {
                let perkDefinition = this.manifestService.getManifestEntry("DestinySandboxPerkDefinition", perk.perkHash);
                inventoryItem.itemValue.perksData.push(perkDefinition);
            });
        }
    }
} 