import { Stat3, Stat4 } from "./_shared.interface";

export interface InventoryBucket {
  hash: number;
  bucketValue: any;
  items: Array<InventoryItem>;
}

export interface InventoryItem {
  bucketHash: number;
  characterIndex: number;
  damageType: number;
  damageTypeHash: number;
  isGridComplete: boolean;
  itemHash: number;
  itemId: string;
  primaryStat?: Stat3;
  quantity: number;
  state: number;
  transferStatus: number;

  // Runtime variables
  damageTypeValue: any;
  itemValue: InventoryItem;
}

interface InventoryItemManifest {
  itemHash: number;
  itemName: string;
  itemDescription: string;
  icon: string;
  hasIcon: boolean;
  secondaryIcon: string;
  actionName: string;
  hasAction: boolean;
  deleteOnAction: boolean;
  tierTypeName: string;
  tierType: number;
  itemTypeName: string;
  bucketTypeHash: number;
  primaryBaseStatHash: number;
  stats: Stats;
  perkHashes: number[];
  specialItemType: number;
  talentGridHash: number;
  equippingBlock: EquippingBlock;
  hasGeometry: boolean;
  statGroupHash: number;
  itemLevels: number[];
  qualityLevel: number;
  equippable: boolean;
  instanced: boolean;
  rewardItemHash: number;
  itemType: number;
  itemSubType: number;
  classType: number;
  sources: Source[];
  itemCategoryHashes: number[];
  sourceHashes: number[];
  nonTransferrable: boolean;
  exclusive: number;
  maxStackSize: number;
  itemIndex: number;
  setItemHashes: any[];
  tooltipStyle: string;
  questlineItemHash: number;
  needsFullCompletion: boolean;
  objectiveHashes: any[];
  allowActions: boolean;
  questTrackingUnlockValueHash: number;
  bountyResetUnlockHash: number;
  uniquenessHash: number;
  showActiveNodesInTooltip: boolean;
  damageTypes: number[];
  hash: number;
  index: number;
  redacted: boolean;
}

interface Source {
  expansionIndex: number;
  level: number;
  minQuality: number;
  maxQuality: number;
  minLevelRequired: number;
  maxLevelRequired: number;
  exclusivity: number;
  computedStats: Stats;
  sourceHashes: number[];
}

interface EquippingBlock {
  weaponSandboxPatternIndex: number;
  gearArtArrangementIndex: number;
  defaultDyes: any[];
  lockedDyes: LockedDye[];
  customDyes: any[];
  customDyeExpression: CustomDyeExpression;
  weaponPatternHash: number;
  arrangements: Arrangement[];
  equipmentSlotHash: number;
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
