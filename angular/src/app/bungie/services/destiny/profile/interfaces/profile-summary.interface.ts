import { Stat3 } from "app/bungie/services/destiny/shared.interface";
import { InventoryItem } from "app/bungie/services/interface.barrel";

export interface IProfileSummary {
    profileInventory: ProfileInventory;
    profileCurrencies: ProfileCurrencies;
    profile: Profile;
    characters: Characters;
    characterInventories: CharacterInventories;
    characterProgressions: CharacterProgressions;
    characterActivities: CharacterActivities;
    characterEquipment: CharacterEquipment;
    itemComponents: ItemComponents;
}

interface ItemComponents {
    instances: Instances;
    objectives: Objectives;
    perks: Perks;
    sockets: Sockets;
    talentGrids: TalentGrids;
    plugStates: PlugStates;
}

interface PlugStates {
    data: Data14;
    privacy: number;
}

interface Data14 {
}

interface TalentGrids {
    data: Data13;
    privacy: number;
}

interface Data13 {
    '6917529029283892198': _69175290292838921984;
    '6917529029276232266': _69175290292838921984;
    '6917529029281192284': _69175290292838921984;
    '6917529029278891265': _69175290292838921984;
    '6917529029283894977': _69175290292838921984;
    '6917529029278885840': _69175290292838921984;
    '6917529029276241822': _69175290292838921984;
    '6917529029268469558': _69175290292838921984;
    '6917529029281201435': _69175290292838921984;
    '6917529029268463882': _69175290292838921984;
    '6917529029281201403': _6917529029281201403;
    '6917529029242695833': _69175290292838921984;
    '6917529029245306239': _69175290292838921984;
    '6917529029245303833': _69175290292838921984;
    '6917529029242698131': _69175290292838921984;
    '6917529029245311408': _69175290292838921984;
    '6917529029245303834': _69175290292838921984;
    '6917529029245311409': _69175290292838921984;
    '6917529029245311645': _69175290292838921984;
    '6917529029245302943': _6917529029281201403;
    '6917529029245311647': _69175290292838921984;
    '6917529029242698235': _69175290292838921984;
    '6917529029245303113': _69175290292838921984;
    '6917529029242692974': _69175290292838921984;
    '6917529029245304228': _69175290292838921984;
    '6917529029245303961': _69175290292838921984;
    '6917529029245304229': _69175290292838921984;
    '6917529029242692548': _69175290292838921984;
    '6917529029245303502': _6917529029281201403;
    '6917529029245303523': _69175290292838921984;
    '6917529029276241776': _69175290292838921984;
    '6917529029278882830': _69175290292838921984;
}

interface _6917529029281201403 {
    talentGridHash: number;
    nodes: Node[];
    isGridComplete: boolean;
}

interface Node {
    nodeIndex: number;
    nodeHash: number;
    state: number;
    isActivated: boolean;
    stepIndex: number;
    materialsToUpgrade: MaterialsToUpgrade[];
    activationGridLevel: number;
    progressPercent: number;
    hidden: boolean;
}

interface MaterialsToUpgrade {
    itemHash: number;
    deleteOnAction: boolean;
    count: number;
    omitFromRequirements: boolean;
}

interface _69175290292838921984 {
    talentGridHash: number;
    nodes: any[];
    isGridComplete: boolean;
}

interface Sockets {
    data: Data12;
    privacy: number;
}

interface Data12 {
    '6917529029283892198': _69175290292838921983;
    '6917529029276232266': _69175290292838921983;
    '6917529029281192284': _69175290292838921983;
    '6917529029268469558': _69175290292838921983;
    '6917529029245306239': _69175290292838921983;
    '6917529029242698235': _69175290292838921983;
    '6917529029278882830': _69175290292838921983;
}

interface _69175290292838921983 {
    sockets: Socket[];
}

interface Socket {
    plugHash: number;
    isEnabled: boolean;
    reusablePlugHashes: number[];
}

interface Perks {
    data: Data11;
    privacy: number;
}

interface Data11 {
    '6917529029283892198': _69175290292838921982;
    '6917529029276232266': _69175290292838921982;
    '6917529029281192284': _69175290292838921982;
    '6917529029281201403': _69175290292838921982;
    '6917529029245306239': _69175290292838921982;
    '6917529029245302943': _69175290292838921982;
    '6917529029242698235': _69175290292838921982;
    '6917529029245303502': _69175290292838921982;
    '6917529029278882830': _69175290292838921982;
}

interface _69175290292838921982 {
    perks: Perk[];
}

interface Perk {
    perkHash: number;
    iconPath: string;
    isActive: boolean;
    visible: boolean;
}

interface Objectives {
    data: Data10;
    privacy: number;
}

interface Data10 {
    '6917529029283896392': _6917529029283896392;
    '6917529029281199517': _6917529029283896392;
    '6917529029245311646': _6917529029245311646;
    '6917529029245303522': _6917529029245311646;
}

interface _6917529029245311646 {
    objectives: StepObjective2[];
}

interface _6917529029283896392 {
    objectives: StepObjective[];
}

interface Instances {
    data: Data9;
    privacy: number;
}

interface Data9 {
    '6917529029283892198': _6917529029283892198;
    '6917529029276232266': _6917529029283892198;
    '6917529029281192284': _6917529029283892198;
    '6917529029278891265': _6917529029278891265;
    '6917529029283894977': _6917529029278891265;
    '6917529029278885840': _6917529029278891265;
    '6917529029276241822': _6917529029278891265;
    '6917529029268469558': _6917529029278891265;
    '6917529029281201435': _6917529029281201435;
    '6917529029268463882': _6917529029281201435;
    '6917529029281201403': _6917529029281201435;
    '6917529029245306475': _6917529029281201435;
    '6917529029242695833': _6917529029281201435;
    '6917529029245306238': _6917529029281201435;
    '6917529029245306239': _6917529029283892198;
    '6917529029245303833': _6917529029278891265;
    '6917529029242698131': _6917529029278891265;
    '6917529029245311408': _6917529029278891265;
    '6917529029245303834': _6917529029278891265;
    '6917529029245311409': _6917529029278891265;
    '6917529029245311645': _6917529029281201435;
    '6917529029245302943': _6917529029281201435;
    '6917529029245302944': _6917529029281201435;
    '6917529029245311647': _6917529029281201435;
    '6917529029245303324': _6917529029281201435;
    '6917529029242698235': _6917529029283892198;
    '6917529029245303113': _6917529029278891265;
    '6917529029242692974': _6917529029278891265;
    '6917529029245304228': _6917529029278891265;
    '6917529029245303961': _6917529029278891265;
    '6917529029245304229': _6917529029278891265;
    '6917529029242692548': _6917529029281201435;
    '6917529029245303502': _6917529029281201435;
    '6917529029240362083': _6917529029281201435;
    '6917529029245303523': _6917529029281201435;
    '6917529029242700651': _6917529029281201435;
    '6917529029283896392': _6917529029281201435;
    '6917529029281199517': _6917529029281201435;
    '6917529029276241776': _6917529029278891265;
    '6917529029245311646': _6917529029281201435;
    '6917529029245303522': _6917529029281201435;
    '6917529029278882830': _6917529029283892198;
}

interface _6917529029281201435 {
    damageType: number;
    itemLevel: number;
    quality: number;
    isEquipped: boolean;
    canEquip: boolean;
    equipRequiredLevel: number;
    unlockHashesRequiredToEquip: number[];
    cannotEquipReason: number;
}

interface _6917529029278891265 {
    damageType: number;
    primaryStat: PrimaryStat;
    itemLevel: number;
    quality: number;
    isEquipped: boolean;
    canEquip: boolean;
    equipRequiredLevel: number;
    unlockHashesRequiredToEquip: number[];
    cannotEquipReason: number;
}

interface _6917529029283892198 {
    damageType: number;
    damageTypeHash: number;
    primaryStat: PrimaryStat;
    itemLevel: number;
    quality: number;
    isEquipped: boolean;
    canEquip: boolean;
    equipRequiredLevel: number;
    unlockHashesRequiredToEquip: number[];
    cannotEquipReason: number;
}

interface PrimaryStat {
    statHash: number;
    value: number;
    maximumValue: number;
}

interface CharacterEquipment {
    data: Data8;
    privacy: number;
}

interface Data8 {
    '2305843009261349838': Data;
    '2305843009261349839': Data;
    '2305843009261349840': Data;
}

interface CharacterActivities {
    data: Data7;
    privacy: number;
}

interface Data7 {
    '2305843009261349838': _23058430092613498384;
    '2305843009261349839': _23058430092613498384;
    '2305843009261349840': _23058430092613498384;
}

interface _23058430092613498384 {
    dateActivityStarted: string;
    availableActivities: AvailableActivity[];
    currentActivityHash: number;
    currentActivityModeHash: number;
    lastCompletedStoryHash: number;
}

interface AvailableActivity {
    activityHash: number;
    isNew: boolean;
    canLead: boolean;
    canJoin: boolean;
    isCompleted: boolean;
    isVisible: boolean;
    recommendedLight: number;
    difficultyTier: number;
}

interface CharacterProgressions {
    data: Data6;
    privacy: number;
}

interface Data6 {
    '2305843009261349838': _23058430092613498383;
    '2305843009261349839': _23058430092613498392;
    '2305843009261349840': _23058430092613498392;
}

interface _23058430092613498392 {
    progressions: Progressions;
    factions: Factions;
    milestones: Milestones2;
    quests: any[];
    uninstancedItemObjectives: UninstancedItemObjectives;
}

interface Milestones2 {
    '202035466': _202035466;
    '342166397': _1142551194;
    '347073893': _347073893;
    '463010297': _202035466;
    '828676398': _828676398;
    '1142551194': _1142551194;
    '1478219986': _1142551194;
    '1680677066': _1142551194;
    '2171429505': _2171429505;
    '2311040624': _347073893;
    '2431288848': _347073893;
    '3245985898': _3245985898;
    '3427325023': _347073893;
    '3551755444': _347073893;
    '3603098564': _202035466;
    '3660836525': _347073893;
    '3875745925': _1142551194;
    '4109359897': _347073893;
    '4253138191': _4253138191;
}

interface _828676398 {
    milestoneHash: number;
    availableQuests: AvailableQuest5[];
}

interface AvailableQuest5 {
    questItemHash: number;
    status: Status3;
}

interface Status3 {
    questHash: number;
    stepHash: number;
    stepObjectives: StepObjective2[];
    tracked: boolean;
    itemInstanceId: string;
    completed: boolean;
    redeemed: boolean;
    started: boolean;
}

interface StepObjective2 {
    objectiveHash: number;
    progress: number;
    complete: boolean;
}

interface _23058430092613498383 {
    progressions: Progressions;
    factions: Factions;
    milestones: Milestones;
    quests: any[];
    uninstancedItemObjectives: UninstancedItemObjectives;
}

interface UninstancedItemObjectives {
    '432848324': _432848324[];
    '2540008660': _432848324[];
}

interface _432848324 {
    objectiveHash: number;
    complete: boolean;
}

interface Milestones {
    '202035466': _202035466;
    '342166397': _342166397;
    '347073893': _347073893;
    '463010297': _202035466;
    '828676398': _342166397;
    '1142551194': _1142551194;
    '1478219986': _1142551194;
    '1680677066': _1142551194;
    '2171429505': _2171429505;
    '2311040624': _347073893;
    '2431288848': _347073893;
    '3245985898': _3245985898;
    '3427325023': _347073893;
    '3551755444': _347073893;
    '3603098564': _202035466;
    '3660836525': _347073893;
    '3875745925': _1142551194;
    '4109359897': _347073893;
    '4253138191': _4253138191;
}

interface _4253138191 {
    milestoneHash: number;
    rewards: Reward[];
    startDate: string;
    endDate: string;
}

interface Reward {
    rewardCategoryHash: number;
    entries: Entry[];
}

interface Entry {
    rewardEntryHash: number;
    earned: boolean;
    redeemed: boolean;
}

interface _3245985898 {
    milestoneHash: number;
    availableQuests: AvailableQuest4[];
}

interface AvailableQuest4 {
    questItemHash: number;
    status: Status;
    activity: Activity2;
}

interface Activity2 {
    activityHash: number;
    variants: Variant[];
}

interface _2171429505 {
    milestoneHash: number;
    availableQuests: AvailableQuest3[];
    startDate: string;
    endDate: string;
}

interface AvailableQuest3 {
    questItemHash: number;
    status: Status;
    activity: Activity;
}

interface Activity {
    activityHash: number;
    modifierHashes: number[];
    variants: Variant[];
}

interface Variant {
    activityHash: number;
}

interface _1142551194 {
    milestoneHash: number;
    availableQuests: AvailableQuest[];
}

interface _347073893 {
    milestoneHash: number;
}

interface _342166397 {
    milestoneHash: number;
    availableQuests: AvailableQuest2[];
}

interface AvailableQuest2 {
    questItemHash: number;
    status: Status2;
}

interface Status2 {
    questHash: number;
    stepHash: number;
    stepObjectives: StepObjective[];
    tracked: boolean;
    itemInstanceId: string;
    completed: boolean;
    redeemed: boolean;
    started: boolean;
}

interface StepObjective {
    objectiveHash: number;
    destinationHash: number;
    activityHash: number;
    progress: number;
    complete: boolean;
}

interface _202035466 {
    milestoneHash: number;
    availableQuests: AvailableQuest[];
    startDate: string;
    endDate: string;
}

interface AvailableQuest {
    questItemHash: number;
    status: Status;
}

interface Status {
    questHash: number;
    stepHash: number;
    stepObjectives: any[];
    tracked: boolean;
    itemInstanceId: string;
    completed: boolean;
    redeemed: boolean;
    started: boolean;
}

interface Factions {
    '611314723': _611314723;
    '697030790': _611314723;
    '828982195': _611314723;
    '1021210278': _611314723;
    '1660497607': _611314723;
    '1761642340': _611314723;
    '3231773039': _611314723;
    '4196149087': _611314723;
    '4235119312': _611314723;
}

interface _611314723 {
    factionHash: number;
    progressionHash: number;
    dailyProgress: number;
    dailyLimit: number;
    weeklyProgress: number;
    weeklyLimit: number;
    currentProgress: number;
    level: number;
    levelCap: number;
    stepIndex: number;
    progressToNextLevel: number;
    nextLevelAt: number;
}

interface Progressions {
    '540048094': LevelProgression;
    '1716568313': LevelProgression;
    '2030054750': LevelProgression;
    '2424694449': LevelProgression;
    '3298204156': LevelProgression;
    '3455936608': LevelProgression;
}

interface CharacterInventories {
    data: Data5;
    privacy: number;
}

interface Data5 {
    '2305843009261349838': _23058430092613498382;
    '2305843009261349839': _23058430092613498382;
    '2305843009261349840': _23058430092613498382;
}

interface _23058430092613498382 {
    items: Item3[];
}

interface Item3 {
    itemHash: number;
    quantity: number;
    bindStatus: number;
    location: number;
    bucketHash: number;
    transferStatus: number;
    lockable: boolean;
    state: number;
    itemInstanceId?: string;
}

interface Characters {
    data: Data4;
    privacy: number;
}

interface Data4 {
    '2305843009261349838': _2305843009261349838;
    '2305843009261349839': _2305843009261349839;
    '2305843009261349840': _2305843009261349840;
}

interface _2305843009261349840 {
    membershipId: string;
    membershipType: number;
    characterId: string;
    dateLastPlayed: string;
    minutesPlayedThisSession: string;
    minutesPlayedTotal: string;
    light: number;
    stats: Stats3;
    raceHash: number;
    genderHash: number;
    classHash: number;
    raceType: number;
    classType: number;
    genderType: number;
    emblemPath: string;
    emblemBackgroundPath: string;
    emblemHash: number;
    levelProgression: LevelProgression;
    baseCharacterLevel: number;
    percentToNextLevel: number;
}

interface Stats3 {
    '144602215': number;
    '392767087': number;
    '1735777505': number;
    '1885944937': number;
    '1935470627': number;
    '1943323491': number;
    '2996146975': number;
    '3555269338': number;
    '3897883278': number;
    '4244567218': number;
}

interface _2305843009261349839 {
    membershipId: string;
    membershipType: number;
    characterId: string;
    dateLastPlayed: string;
    minutesPlayedThisSession: string;
    minutesPlayedTotal: string;
    light: number;
    stats: Stats2;
    raceHash: number;
    genderHash: number;
    classHash: number;
    raceType: number;
    classType: number;
    genderType: number;
    emblemPath: string;
    emblemBackgroundPath: string;
    emblemHash: number;
    levelProgression: LevelProgression;
    baseCharacterLevel: number;
    percentToNextLevel: number;
}

interface Stats2 {
    '144602215': number;
    '392767087': number;
    '1735777505': number;
    '1885944937': number;
    '1935470627': number;
    '1943323491': number;
    '3555269338': number;
    '3897883278': number;
    '4244567218': number;
}

interface _2305843009261349838 {
    membershipId: string;
    membershipType: number;
    characterId: string;
    dateLastPlayed: string;
    minutesPlayedThisSession: string;
    minutesPlayedTotal: string;
    light: number;
    stats: Stats;
    raceHash: number;
    genderHash: number;
    classHash: number;
    raceType: number;
    classType: number;
    genderType: number;
    emblemPath: string;
    emblemBackgroundPath: string;
    emblemHash: number;
    levelProgression: LevelProgression;
    baseCharacterLevel: number;
    percentToNextLevel: number;
}

interface LevelProgression {
    progressionHash: number;
    dailyProgress: number;
    dailyLimit: number;
    weeklyProgress: number;
    weeklyLimit: number;
    currentProgress: number;
    level: number;
    levelCap: number;
    stepIndex: number;
    progressToNextLevel: number;
    nextLevelAt: number;
}

interface Stats {
    '144602215': number;
    '392767087': number;
    '1735777505': number;
    '1885944937': number;
    '1935470627': number;
    '2996146975': number;
    '3555269338': number;
    '3897883278': number;
    '4244567218': number;
}

interface Profile {
    data: Data3;
    privacy: number;
}

interface Data3 {
    userInfo: UserInfo;
    dateLastPlayed: string;
    versionsOwned: number;
    characterIds: string[];
}

interface UserInfo {
    membershipType: number;
    membershipId: string;
    displayName: string;
}

interface ProfileCurrencies {
    data: Data2;
    privacy: number;
}

interface Data2 {
    items: Item2[];
}

interface Item2 {
    itemHash: number;
    quantity: number;
    bindStatus: number;
    location: number;
    bucketHash: number;
    transferStatus: number;
    lockable: boolean;
    state: number;
}

interface ProfileInventory {
    data: Data;
    privacy: number;
}

interface Data {
    items: InventoryItem[];
}

interface Item {
    itemHash: number;
    itemInstanceId: string;
    quantity: number;
    bindStatus: number;
    location: number;
    bucketHash: number;
    transferStatus: number;
    lockable: boolean;
    state: number;
}