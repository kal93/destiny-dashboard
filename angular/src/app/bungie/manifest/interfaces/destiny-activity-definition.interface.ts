export interface DestinyActivityDefinition {
    displayProperties: DisplayProperties;
    releaseIcon: string;
    releaseTime: number;
    activityLevel: number;
    completionUnlockHash: number;
    activityLightLevel: number;
    destinationHash: number;
    placeHash: number;
    activityTypeHash: number;
    tier: number;
    pgcrImage: string;
    rewards: Reward[];
    modifiers: Modifier[];
    isPlaylist: boolean;
    challenges: Challenge[];
    optionalUnlockStrings: any[];
    inheritFromFreeRoam: boolean;
    suppressOtherRewards: boolean;
    playlistItems: any[];
    matchmaking: Matchmaking;
    activityModeHash: number;
    isPvP: boolean;
    hash: number;
    index: number;
    redacted: boolean;
}

interface Matchmaking {
    isMatchmade: boolean;
    minParty: number;
    maxParty: number;
    maxPlayers: number;
    requiresGuardianOath: boolean;
}

interface Challenge {
    rewardSiteHash: number;
    inhibitRewardsUnlockHash: number;
    objectiveHash: number;
}

interface Modifier {
    activityModifierHash: number;
}

interface Reward {
    rewardItems: RewardItem[];
}

interface RewardItem {
    itemHash: number;
    quantity: number;
}

interface DisplayProperties {
    description: string;
    name: string;
    icon: string;
    hasIcon: boolean;
}