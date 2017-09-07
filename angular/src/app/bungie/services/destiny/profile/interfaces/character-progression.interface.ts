import { DestinyFactionDefinition, DestinyMilestoneDefinition, DestinyProgressionDefinition } from "app/bungie/manifest/interfaces/";

export interface ICharacterProgression {
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
}

export interface MilestoneBase {
    milestoneHash: number;
    availableQuests: AvailableQuest[];
    startDate: string;
    endDate: string;

    // Runtime variables
    milestoneValue: DestinyMilestoneDefinition;
}

interface ItemComponents {
}

interface AvailableQuest {
    questItemHash: number;
    status: Status;
}

interface AvailableQuest2 {
    questItemHash: number;
    status: Status2;
}
interface AvailableQuest3 {
    questItemHash: number;
    status: Status;
    activity: Activity;
}

interface AvailableQuest4 {
    questItemHash: number;
    status: Status;
    activity: Activity2;
}

interface Activity {
    activityHash: number;
    modifierHashes: number[];
    variants: Variant[];
}

interface Activity2 {
    activityHash: number;
    variants: Variant[];
}

interface Status {
    questHash: number;
    stepHash: number;
    stepObjectives: any[];
    tracked: boolean;
    itemInstanceId: string;
    completed: boolean;
    redeemed: boolean;
    started: boolean;
}

interface Status2 {
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