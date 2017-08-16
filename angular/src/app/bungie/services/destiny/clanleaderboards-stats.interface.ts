import { Basic } from "./_shared.interface";
import { DestinyMembership } from "../user/user.interface";

export interface IClanLeaderboardsStats {
    // ModeType = 4 
    raid: {
        lbSingleGameKills: LbStats;
        lbSingleGameScore: LbStats;
        lbMostPrecisionKills: LbStats;
        lbLongestKillSpree: LbStats;
        lbLongestSingleLife: LbStats;

    }
    // ModeType = 5
    allPvP: {
        lbSingleGameKills: LbStats;
        lbSingleGameScore: LbStats;
        lbMostPrecisionKills: LbStats;
        lbLongestKillSpree: LbStats;
        lbLongestSingleLife: LbStats;
    }
    // ModeType = 7
    allPvE: {
        lbSingleGameKills: LbStats;
        lbSingleGameScore: LbStats;
        lbMostPrecisionKills: LbStats;
        lbLongestKillSpree: LbStats;
        lbLongestSingleLife: LbStats;
    }
    // ModeType = 14
    trialsofosiris: {
        lbSingleGameKills: LbStats;
        lbSingleGameScore: LbStats;
        lbMostPrecisionKills: LbStats;
        lbLongestKillSpree: LbStats;
        lbLongestSingleLife: LbStats;
    }
    // ModeType = 16
    nightfall: {
        lbSingleGameKills: LbStats;
        lbSingleGameScore: LbStats;
        lbMostPrecisionKills: LbStats;
        lbLongestKillSpree: LbStats;
        lbLongestSingleLife: LbStats;
    }
    // ModeType = 18
    allstrikes: {
        lbSingleGameKills: LbStats;
        lbSingleGameScore: LbStats;
        lbMostPrecisionKills: LbStats;
        lbLongestKillSpree: LbStats;
        lbLongestSingleLife: LbStats;
    }
}

interface LbStats {
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

/* For reference:

export interface DestinyMembership {
    iconPath: string;
    membershipType: number;
    membershipId: string;
    displayName: string;
}

export interface Basic {
    displayValue: string;
    value: number;
}

*/