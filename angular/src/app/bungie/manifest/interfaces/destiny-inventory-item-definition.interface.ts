import { Stat4 } from "../../services/destiny/shared.interface";

export interface DestinyInventoryItemDefinition {
    actionName: string;
    allowActions: boolean;
    bountyResetUnlockHash: number;
    bucketTypeHash: number;
    classType: number;
    damageTypes: number[];
    deleteOnAction: boolean;
    equippable: boolean;
    equippingBlock: EquippingBlock;
    exclusive: number;
    hasAction: boolean;
    hasGeometry: boolean;
    hasIcon: boolean;
    hash: number;
    icon: string;
    index: number;
    instanced: boolean;
    itemCategoryHashes: number[];
    itemDescription: string;
    itemHash: number;
    itemIndex: number;
    itemLevels: number[];
    itemName: string;
    itemSubType: number;
    itemType: number;
    itemTypeName: string;
    maxStackSize: number;
    needsFullCompletion: boolean;
    nonTransferrable: boolean;
    objectiveHashes: any[];
    perkHashes: number[];
    primaryBaseStatHash: number;
    qualityLevel: number;
    questTrackingUnlockValueHash: number;
    questlineItemHash: number;
    redacted: boolean;
    rewardItemHash: number;
    secondaryIcon: string;
    setItemHashes: any[];
    showActiveNodesInTooltip: boolean;
    sourceHashes: number[];
    sources: Source[];
    specialItemType: number;
    statGroupHash: number;
    stats: Stats;
    talentGridHash: number;
    tierType: number;
    tierTypeName: string;
    tooltipStyle: string;
    uniquenessHash: number;
}


interface Source {
    computedStats: Stats;
    exclusivity: number;
    expansionIndex: number;
    level: number;
    maxLevelRequired: number;
    maxQuality: number;
    minLevelRequired: number;
    minQuality: number;
    sourceHashes: number[];
}

interface EquippingBlock {
    arrangements: Arrangement[];
    customDyeExpression: CustomDyeExpression;
    customDyes: any[];
    defaultDyes: any[];
    equipmentSlotHash: number;
    gearArtArrangementIndex: number;
    lockedDyes: LockedDye[];
    weaponPatternHash: number;
    weaponSandboxPatternIndex: number;
}

interface Arrangement {
    classHash: number;
    gearArtArrangementIndex: number;
}

interface CustomDyeExpression {
    steps: any[];
}

interface LockedDye {
    channelHash: number;
    dyeHash: number;
}

interface Stats {
    '155624089': Stat4;
    '368428387': Stat4;
    '943549884': Stat4;
    '1240592695': Stat4;
    '1345609583': Stat4;
    '1931675084': Stat4;
    '2391494160': Stat4;
    '2715839340': Stat4;
    '3555269338': Stat4;
    '3871231066': Stat4;
    '4043523819': Stat4;
    '4188031367': Stat4;
    '4284893193': Stat4;
}
