import { DestinyFactionDefinition, DestinyProgressionDefinition } from "../../../manifest/interfaces/";

export interface ICharacterProgression {
    progressions: SummaryProgression;
    progressionsData: Array<ProgressionBase>;
}

interface SummaryProgression {
    data: { [key: number]: ProgressionBase[] };
    privacy: number;
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

    // Populated at runtime
    progressionValue: DestinyProgressionDefinition;
    factionValue: DestinyFactionDefinition;
}
