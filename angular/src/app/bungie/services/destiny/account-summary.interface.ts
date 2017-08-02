
export interface IAccountSummary {
    membershipId: string;
    membershipType: number;
    characters: ICharacter[];
    inventory: IInventory;
    grimoireScore: number;
    versions: number;
}

export interface ICharacter {
    characterBase: ICharacterBase;
    levelProgression: ILevelProgression;
    emblemPath: string;
    backgroundPath: string;
    emblemHash: any;
    characterLevel: number;
    baseCharacterLevel: number;
    isPrestigeLevel: boolean;
    percentToNextLevel: number;
}

export interface ICharacterBase {
    membershipId: string;
    membershipType: number;
    characterId: string;
    dateLastPlayed: Date;
    minutesPlayedThisSession: string;
    minutesPlayedTotal: string;
    powerLevel: number;
    raceHash: any;
    genderHash: any;
    classHash: any;
    currentActivityHash: number;
    lastCompletedStoryHash: number;
    stats: IStats;
    customization: ICustomization;
    grimoireScore: number;
    peerView: IPeerView;
    genderType: number;
    classType: number;
    buildStatGroupHash: any;
}

export interface ILevelProgression {
    dailyProgress: number;
    weeklyProgress: number;
    currentProgress: number;
    level: number;
    step: number;
    progressToNextLevel: number;
    nextLevelAt: number;
    progressionHash: number;
}

export interface IStats {
    STAT_DEFENSE: IStat;
    STAT_INTELLECT: IStat;
    STAT_DISCIPLINE: IStat;
    STAT_STRENGTH: IStat;
    STAT_LIGHT: IStat;
    STAT_ARMOR: IStat;
    STAT_AGILITY: IStat;
    STAT_RECOVERY: IStat;
    STAT_OPTICS: IStat;
    STAT_ATTACK_SPEED: IStat;
    STAT_DAMAGE_REDUCTION: IStat;
    STAT_ATTACK_EFFICIENCY: IStat;
    STAT_ATTACK_ENERGY: IStat;
}

export interface IStat {
    statHash: number;
    value: number;
    maximumValue: number;
}

export interface ICustomization {
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

export interface IPeerView {
    equipment: IEquipment[];
}

export interface IEquipment {
    itemHash: any;
    dyes: IDye[];
}

export interface IDye {
    channelHash: any;
    dyeHash: any;
}

export interface IInventory {
    items: IItem[];
    currencies: ICurrency[];
}

export interface IItem {
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
    primaryStat: IStat;
}

export interface ICurrency {
    itemHash: any;
    value: number;
}