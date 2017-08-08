
export interface IAccountSummary {
    membershipId: string;
    membershipType: number;
    characters: SummaryCharacter[];
    inventory: Inventory;
    grimoireScore: number;
    versions: number;
}

export interface SummaryCharacter {
    characterBase: CharacterBase;
    levelProgression: LevelProgression;
    emblemPath: string;
    backgroundPath: string;
    emblemHash: any;
    characterLevel: number;
    baseCharacterLevel: number;
    isPrestigeLevel: boolean;
    percentToNextLevel: number;
}

interface CharacterBase {
    buildStatGroupHash: any;
    characterId: string;
    classHash: any;
    classType: number;
    currentActivityHash: number;
    customization: Customization;
    dateLastPlayed: Date;
    genderHash: any;
    genderType: number;
    grimoireScore: number;
    lastCompletedStoryHash: number;
    membershipId: string;
    membershipType: number;
    minutesPlayedThisSession: string;
    minutesPlayedTotal: string;
    peerView: PeerView;
    powerLevel: number;
    raceHash: any;
    stats: Stats;

    //Runtime variables
    classHashValue: any;
    genderHashValue: any;
    raceHashValue: any;
}

interface LevelProgression {
    dailyProgress: number;
    weeklyProgress: number;
    currentProgress: number;
    level: number;
    step: number;
    progressToNextLevel: number;
    nextLevelAt: number;
    progressionHash: number;
}

interface Stats {
    STAT_DEFENSE: Stat;
    STAT_INTELLECT: Stat;
    STAT_DISCIPLINE: Stat;
    STAT_STRENGTH: Stat;
    STAT_LIGHT: Stat;
    STAT_ARMOR: Stat;
    STAT_AGILITY: Stat;
    STAT_RECOVERY: Stat;
    STAT_OPTICS: Stat;
    STAT_ATTACK_SPEED: Stat;
    STAT_DAMAGE_REDUCTION: Stat;
    STAT_ATTACK_EFFICIENCY: Stat;
    STAT_ATTACK_ENERGY: Stat;
}

interface Stat {
    statHash: number;
    value: number;
    maximumValue: number;
}

interface Customization {
    personality: any;
    face: any;
    skinColor: number;
    lipColor: any;
    eyeColor: number;
    hairColor: any;
    featureColor: any;
    decalColor: any;
    wearHelmet: boolean;
    hairIndex: number;
    featureIndex: number;
    decalIndex: number;
}

export interface PeerView {
    equipment: Equipment[];
}

export interface Equipment {
    itemHash: any;
    dyes: Dye[];
}

export interface Dye {
    channelHash: any;
    dyeHash: any;
}

interface Inventory {
    items: Item[];
    currencies: Currency[];
}

interface Item {
    itemHash: any;
    itemId: string;
    quantity: number;
    damageType: number;
    damageTypeHash: any;
    isGridComplete: boolean;
    transferStatus: number;
    state: number;
    characterIndex: number;
    bucketHash: any;
    primaryStat: Stat;
}

interface Currency {
    itemHash: any;
    value: number;
}