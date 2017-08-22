import { Stat1, Stat2, PvEStats, PvPStats } from "../shared.interface";

export interface ICharacterStats {
    allPvE: {
        allTime: PvEStats,
        monthly: PvEStats,
        daily: PvEStats
    }
    allPvP: {
        allTime: PvPStats,
        monthly: PvPStats,
        daily: PvPStats
    }
}
