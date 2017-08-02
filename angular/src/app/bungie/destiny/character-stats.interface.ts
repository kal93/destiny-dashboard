
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

export interface PvEStats {
    activitiesCleared: Stat1;
    weaponKillsSuper: Stat2;
    activitiesEntered: Stat1;
    weaponKillsMelee: Stat2;
    weaponKillsGrenade: Stat2;
    abilityKills: Stat2;
    assists: Stat2;
    totalDeathDistance: Stat1;
    averageDeathDistance: Stat1;
    totalKillDistance: Stat1;
    kills: Stat2;
    averageKillDistance: Stat1;
    secondsPlayed: Stat2;
    deaths: Stat2;
    averageLifespan: Stat1;
    bestSingleGameKills: Stat1;
    killsDeathsRatio: Stat1;
    killsDeathsAssists: Stat1;
    objectivesCompleted: Stat2;
    precisionKills: Stat2;
    resurrectionsPerformed: Stat2;
    resurrectionsReceived: Stat2;
    suicides: Stat2;
    weaponKillsAutoRifle: Stat2;
    weaponKillsFusionRifle: Stat2;
    weaponKillsHandCannon: Stat2;
    weaponKillsMachinegun: Stat2;
    weaponKillsPulseRifle: Stat2;
    weaponKillsRocketLauncher: Stat2;
    weaponKillsScoutRifle: Stat2;
    weaponKillsShotgun: Stat2;
    weaponKillsSniper: Stat2;
    weaponKillsSubmachinegun: Stat2;
    weaponKillsRelic: Stat2;
    weaponKillsSideArm: Stat2;
    weaponKillsSword: Stat2;
    weaponBestType: Stat1;
    allParticipantsCount: Stat1;
    allParticipantsTimePlayed: Stat1;
    longestKillSpree: Stat1;
    longestSingleLife: Stat1;
    mostPrecisionKills: Stat1;
    orbsDropped: Stat2;
    orbsGathered: Stat2;
    publicEventsCompleted: Stat2;
    publicEventsJoined: Stat2;
    remainingTimeAfterQuitSeconds: Stat2;
    totalActivityDurationSeconds: Stat2;
    fastestCompletion: Stat1;
    courtOfOryxWinsTier1: Stat1;
    courtOfOryxWinsTier2: Stat1;
    courtOfOryxWinsTier3: Stat1;
    courtOfOryxAttempts: Stat1;
    courtOfOryxCompletions: Stat1;
    longestKillDistance: Stat1;
    highestCharacterLevel: Stat1;
    highestLightLevel: Stat1;
}


export interface PvPStats {
    weaponKillsSuper: Stat2;
    activitiesEntered: Stat1;
    weaponKillsMelee: Stat2;
    weaponKillsGrenade: Stat2;
    abilityKills: Stat2;
    activitiesWon: Stat1;
    assists: Stat2;
    totalDeathDistance: Stat1;
    averageDeathDistance: Stat1;
    totalKillDistance: Stat1;
    kills: Stat2;
    averageKillDistance: Stat1;
    secondsPlayed: Stat2;
    deaths: Stat2;
    averageLifespan: Stat1;
    score: Stat2;
    averageScorePerKill: Stat1;
    averageScorePerLife: Stat1;
    bestSingleGameKills: Stat1;
    bestSingleGameScore: Stat1;
    closeCalls: Stat2;
    dominationKills: Stat2;
    killsDeathsRatio: Stat1;
    killsDeathsAssists: Stat1;
    objectivesCompleted: Stat2;
    precisionKills: Stat2;
    resurrectionsPerformed: Stat2;
    resurrectionsReceived: Stat2;
    suicides: Stat2;
    weaponKillsAutoRifle: Stat2;
    weaponKillsFusionRifle: Stat2;
    weaponKillsHandCannon: Stat2;
    weaponKillsMachinegun: Stat2;
    weaponKillsPulseRifle: Stat2;
    weaponKillsRocketLauncher: Stat2;
    weaponKillsScoutRifle: Stat2;
    weaponKillsShotgun: Stat2;
    weaponKillsSniper: Stat2;
    weaponKillsSubmachinegun: Stat2;
    weaponKillsRelic: Stat2;
    weaponKillsSideArm: Stat2;
    weaponKillsSword: Stat2;
    weaponBestType: Stat1;
    winLossRatio: Stat1;
    allParticipantsCount: Stat1;
    allParticipantsScore: Stat1;
    allParticipantsTimePlayed: Stat1;
    defensiveKills: Stat1;
    longestKillSpree: Stat1;
    longestSingleLife: Stat1;
    mostPrecisionKills: Stat1;
    offensiveKills: Stat2;
    orbsDropped: Stat2;
    orbsGathered: Stat2;
    relicsCaptured: Stat2;
    remainingTimeAfterQuitSeconds: Stat2;
    teamScore: Stat2;
    totalActivityDurationSeconds: Stat2;
    zonesCaptured: Stat2;
    zonesNeutralized: Stat2;
    combatRating: Stat1;
    longestKillDistance: Stat1;
    highestCharacterLevel: Stat1;
    highestLightLevel: Stat1;
}
export interface Stat2 {
    basic: Basic;
    statId: string;
    pga: Basic;
}

export interface Stat1 {
    basic: Basic;
    statId: string;
}

export interface Basic {
    displayValue: string;
    value: number;
}