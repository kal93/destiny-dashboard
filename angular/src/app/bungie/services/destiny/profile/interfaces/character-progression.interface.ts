import { Inventory, InventoryItem, Reward } from 'app/bungie/services/interface.barrel';

import {
    DestinyFactionDefinition, DestinyInventoryItemDefinition, DestinyMilestoneDefinition, DestinyProgressionDefinition, QuestRewards
} from "app/bungie/manifest/interfaces/";

export interface ICharacterProgression {
    inventory: Inventory;
    progressions: ProgressionWraper;
    itemComponents: ItemComponents;

    // Runtime variables
    progressionData: Array<ProgressionBase>;
    factionData: Array<FactionBase>;
    milestoneData: Array<MilestoneBase>;
}

interface ProgressionWraper {
    data: Data;
    privacy: number;
}

interface Data {
    progressions: { [key: number]: ProgressionBase[] };
    factions: { [key: number]: FactionBase[] };
    milestones: { [key: number]: MilestoneBase[] };
    quests: any[];
    uninstancedItemObjectives: any;
}

export interface ProgressionBase {
    currentProgress: number;
    dailyLimit: number;
    dailyProgress: number;
    level: number;
    levelCap: number;
    nextLevelAt: number;
    progressionHash: number;
    progressToNextLevel: number;
    stepIndex: number;
    weeklyLimit: number;
    weeklyProgress: number;

    // Runtime variables
    progressionValue: DestinyProgressionDefinition;
}

export interface FactionBase {
    currentProgress: number;
    dailyLimit: number;
    dailyProgress: number;
    factionHash: number;
    level: number;
    levelCap: number;
    nextLevelAt: number;
    progressionHash: number;
    progressToNextLevel: number;
    stepIndex: number;
    weeklyLimit: number;
    weeklyProgress: number;

    // Runtime variables
    factionValue: DestinyFactionDefinition;
    factionInventoryItems: Array<InventoryItem>;
}

export interface MilestoneBase {
    milestoneHash: number;
    availableQuests: AvailableQuest[];
    startDate: string;
    endDate: string;
    rewards: Array<Reward>;

    // Runtime variables
    milestoneValue: DestinyMilestoneDefinition;
}

interface ItemComponents {
}

export interface AvailableQuest {
    questItemHash: number;
    status: Status;
    activity: Activity;

    // Runtime variables
    questItemValue: DestinyInventoryItemDefinition;
    questRewards: QuestRewards;
}

interface Activity {
    activityHash: number;
    modifierHashes: number[];
    variants: Variant[];
}

interface Status {
    questHash: number;
    stepHash: number;
    stepObjectives: StepObjective[];
    tracked: boolean;
    itemInstanceId: string;
    completed: boolean;
    redeemed: boolean;
    started: boolean;
}

interface StepObjective {
    objectiveHash: number;
    destinationHash: number;
    activityHash: number;
    progress: number;
    complete: boolean;
}

interface Variant {
    activityHash: number;
}