import { DisplayProperties } from "app/bungie/services/destiny/shared.interface";

export interface DestinyInventoryItemDefinition {
    action: Action;
    allowActions: boolean;
    classType: number;
    defaultDamageType: number;
    defaultDamageTypeHash: number;
    displayProperties: DisplayProperties;
    displaySource: string;
    equippable: boolean;
    equippingBlock: EquippingBlock;
    hash: number;
    index: number;
    inventory: Inventory;
    investmentStats: InvestmentStat[];
    itemCategoryHashes: number[];
    itemSubType: number;
    itemType: number;
    itemTypeAndTierDisplayName: string;
    itemTypeDisplayName: string;
    nonTransferrable: boolean;
    perks: any[]; //DestinySandboxPerkDefinition
    quality: Quality;
    redacted: boolean;
    screenshot: string;
    sockets: Sockets;
    sourceData: SourceData;
    specialItemType: number;
    stats: Stats2;
    talentGrid: TalentGrid;
    translationBlock: TranslationBlock;

    // Runtime variables
    className: string;
    tierName: string;
    perksData: Array<PerkDefinition>;
}

export interface PerkDefinition {
    displayProperties: DisplayProperties;
    isDisplayable: boolean;
    damageType: number;
    hash: number;
    index: number;
    redacted: boolean;
}

interface InvestmentStat {
    statTypeHash: number;
    value: number;
}

interface TalentGrid {
    talentGridHash: number;
    itemDetailString: string;
    hudDamageType: number;
}

interface Sockets {
    detail: string;
    socketEntries: SocketEntry[];
    socketCategories: SocketCategory[];
}

interface SocketCategory {
    socketCategoryHash: number;
    socketIndexes: number[];
}

interface SocketEntry {
    socketTypeHash: number;
    singleInitialItemHash: number;
    singleInitialRewardItemListHash: number;
    reusablePlugItems: ReusablePlugItem[];
}

interface ReusablePlugItem {
    plugItemHash: number;
}

interface SourceData {
    sourceHashes: any[];
    sources: Source[];
    exclusive: number;
}

interface Source {
    level: number;
    minQuality: number;
    maxQuality: number;
    minLevelRequired: number;
    maxLevelRequired: number;
    exclusivity: number;
    computedStats: Stats;
    sourceHashes: any[];
}

interface Quality {
    itemLevels: any[];
    qualityLevel: number;
    infusionCategoryName: string;
    infusionCategoryHash: number;
    progressionLevelRequirementHash: number;
}

interface TranslationBlock {
    weaponPatternHash: number;
    defaultDyes: DefaultDye[];
    lockedDyes: any[];
    customDyes: any[];
    arrangements: Arrangement[];
    hasGeometry: boolean;
}

interface Arrangement {
    classHash: number;
    artArrangementHash: number;
}

interface DefaultDye {
    channelHash: number;
    dyeHash: number;
}

interface EquippingBlock {
    uniqueLabelHash: number;
    equipmentSlotTypeHash: number;
    attributes: number;
    equippingSoundHash: number;
    hornSoundHash: number;
    displayStrings: string[];
}

interface Stats2 {
    statGroupHash: number;
    stats: Stats;
    hasDisplayableStats: boolean;
    primaryBaseStatHash: number;
}

interface Stats {
    '1885944937': _1885944937;
    '1935470627': _1885944937;
    '3897883278': _1885944937;
}

interface _1885944937 {
    statHash: number;
    value: number;
    minimum: number;
    maximum: number;
}

interface Inventory {
    maxStackSize: number;
    bucketTypeHash: number;
    recoveryBucketTypeHash: number;
    tierTypeHash: number;
    isInstanceItem: boolean;
    nonTransferrableOriginal: boolean;
    tierTypeName: string;
    tierType: number;
}

interface Action {
    verbName: string;
    isPositive: boolean;
    requiredCooldownSeconds: number;
    requiredItems: any[];
    progressionRewards: any[];
    actionTypeLabel: string;
    rewardSheetHash: number;
    rewardItemHash: number;
    rewardSiteHash: number;
    requiredCooldownHash: number;
    deleteOnAction: boolean;
    consumeEntireStack: boolean;
    useOnAcquire: boolean;
}