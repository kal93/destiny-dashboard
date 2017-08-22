import { Basic } from "../shared.interface";
import { DestinyMembership } from "../../user/user.interface";

// These are the six game modes needed for the clan-leaderboards card
//   but there are more modes available - see ModeTypes enum

export interface IClanLeaderboardsStats {
    // ModeType = 4 
    raid: {
        lbSingleGameKills: LbStats;
        lbSingleGameScore?: LbStats;
        lbMostPrecisionKills: LbStats;
        lbLongestKillSpree: LbStats;
        lbLongestSingleLife: LbStats;

    }
    // ModeType = 5
    allPvP: {
        lbSingleGameKills: LbStats;
        lbSingleGameScore?: LbStats;
        lbMostPrecisionKills: LbStats;
        lbLongestKillSpree: LbStats;
        lbLongestSingleLife: LbStats;
    }
    // ModeType = 7
    allPvE: {
        lbSingleGameKills: LbStats;
        lbSingleGameScore?: LbStats;
        lbMostPrecisionKills: LbStats;
        lbLongestKillSpree: LbStats;
        lbLongestSingleLife: LbStats;
    }
    // ModeType = 14
    trialsofosiris: {
        lbSingleGameKills: LbStats;
        lbSingleGameScore?: LbStats;
        lbMostPrecisionKills: LbStats;
        lbLongestKillSpree: LbStats;
        lbLongestSingleLife: LbStats;
    }
    // ModeType = 16
    nightfall: {
        lbSingleGameKills: LbStats;
        lbSingleGameScore?: LbStats;
        lbMostPrecisionKills: LbStats;
        lbLongestKillSpree: LbStats;
        lbLongestSingleLife: LbStats;
    }
    // ModeType = 18
    allStrikes: {
        lbSingleGameKills: LbStats;
        lbSingleGameScore?: LbStats;
        lbMostPrecisionKills: LbStats;
        lbLongestKillSpree: LbStats;
        lbLongestSingleLife: LbStats;
    }
}

export interface LbStats {
    statId: string;
    entries: LbEntries[];
}

interface LbEntries {
    rank: number;
    player: LbPlayer;
    characterId: string;
    value: LbValue;
}

interface LbPlayer {
    destinyUserInfo: DestinyMembership;
    characterClass: string;
    characterLevel: number;
    lightLevel: number;
    bungieNetUserInfo: DestinyMembership;
}

interface LbValue {
    basic: Basic;
}