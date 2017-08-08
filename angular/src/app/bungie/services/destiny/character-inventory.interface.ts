import { Progression, Stat3 } from "./_shared.interface";

export interface ICharacterInventory {
  buckets: Buckets;
  currencies: Currency[];
}

interface Currency {
  itemHash: number;
  value: number;
}

interface Buckets {
  Invisible: Invisible[];
  Item: Invisible[];
  Equippable: Equippable[];
}

interface Equippable {
  items: CharacterInventoryItem[];
  bucketHash: number;
}

export interface CharacterInventoryItem {
  itemHash: number;
  bindStatus: number;
  isEquipped: boolean;
  itemInstanceId: string;
  itemLevel: number;
  stackSize: number;
  qualityLevel: number;
  stats: Stat3[];
  canEquip: boolean;
  equipRequiredLevel: number;
  unlockFlagHashRequiredToEquip: number;
  cannotEquipReason: number;
  damageType: number;
  damageTypeHash: number;
  damageTypeNodeIndex: number;
  damageTypeStepIndex: number;
  progression?: Progression;
  talentGridHash: number;
  nodes: Node[];
  useCustomDyes: boolean;
  artRegions: ArtRegions;
  isEquipment: boolean;
  isGridComplete: boolean;
  perks: Perk[];
  location: number;
  transferStatus: number;
  locked: boolean;
  lockable: boolean;
  objectives: any[];
  state: number;
  primaryStat?: Stat3;
}

interface Perk {
  iconPath: string;
  perkHash: number;
  isActive: boolean;
}

interface ArtRegions {
  '3'?: number;
  '21'?: number;
  '5'?: number;
}

interface Node {
  isActivated: boolean;
  stepIndex: number;
  state: number;
  hidden: boolean;
  nodeHash: number;
}

interface Invisible {
  items: any[];
  bucketHash: number;
}