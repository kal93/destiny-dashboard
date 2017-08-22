import { Basic, Stat1, Stat2, PvEStats, PvPStats } from "../shared.interface";

export interface IAccountStats {
    mergedDeletedCharacters: MergedCharacterData;
    mergedAllCharacters: MergedCharacterData;
    characters: StatsCharacter[];
}

export interface StatsCharacter {
    characterId: string;
    deleted: boolean;
    results: Results;
    merged: Merged;
}

export interface MergedCharacterData {
    results: Results;
    merged: Merged;
}

export interface Merged {
    allTime: PvEStats & PvPStats;
}

export interface Results {
    allPvE: {
        allTime: PvEStats;
    };
    allPvP: {
        allTime: PvPStats;
    };
}