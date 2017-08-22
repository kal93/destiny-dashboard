import { Progression, Stat3 } from "../shared.interface";
import { InventoryItem } from "./inventory-item.interface";

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
  artRegions: ArtRegions;
  bindStatus: number;
  canEquip: boolean;
  cannotEquipReason: number;
  damageType: number;
  damageTypeHash: number;
  damageTypeNodeIndex: number;
  damageTypeStepIndex: number;
  equipRequiredLevel: number;
  isEquipment: boolean;
  isEquipped: boolean;
  isGridComplete: boolean;
  itemHash: number;
  itemInstanceId: string;
  itemLevel: number;
  location: number;
  lockable: boolean;
  locked: boolean;
  nodes: Node[];
  objectives: any[];
  perks: Perk[];
  primaryStat?: Stat3;
  progression?: Progression;
  qualityLevel: number;
  stackSize: number;
  state: number;
  stats: Stat3[];
  talentGridHash: number;
  transferStatus: number;
  unlockFlagHashRequiredToEquip: number;
  useCustomDyes: boolean;

  //Runtime variable
  itemValue: InventoryItem;
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