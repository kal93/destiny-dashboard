

export interface ICharacterProgression {
    progressions: Progression[];
    levelProgression: Progression;
    baseCharacterLevel: number;
    isPrestigeLevel: boolean;
    factionProgressionHash: number;
    percentToNextLevel: number;
}

export interface Progression {
    dailyProgress: number;
    weeklyProgress: number;
    currentProgress: number;
    level: number;
    step: number;
    progressToNextLevel: number;
    nextLevelAt: number;
    progressionHash: number;

    // Populated at runtime
    progressionValue: any;
    factionValue: any;
}