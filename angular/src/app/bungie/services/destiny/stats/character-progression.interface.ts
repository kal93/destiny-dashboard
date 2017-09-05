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
    dailyProgress: number;
    weeklyProgress: number;
    currentProgress: number;
    level: number;
    step: number;
    progressToNextLevel: number;
    nextLevelAt: number;
    progressionHash: number;

    // Populated at runtime
    progressionValue: DestinyProgressionDefinition;
    factionValue: DestinyFactionDefinition;
}
