import { Stat3 } from "app/bungie/services/destiny/shared.interface";

import { DestinyMembership } from 'app/bungie/services/interface.barrel';
import { DestinyDamageTypeDefinition, DestinyInventoryBucketDefinition, DestinyInventoryItemDefinition } from "app/bungie/manifest/interfaces";


export interface InventoryItemTransferResult {
  Response: number;
  ErrorCode: number;
  ThrottleSeconds: number;
  ErrorStatus: string;
  Message: string;
  MessageData: any;

  // Runtime variables
  inventoryItem: InventoryItem;
  refreshRequired: boolean;
}

export interface InventoryBucket {
  bucketValue: DestinyInventoryBucketDefinition;
  hash: number;
  items: Array<InventoryItem>;

  // Runtime variables
  filteredOut: boolean;
}

export interface InventoryItem {
  bindStatus: number;
  bucketHash: number;
  itemHash: number;
  itemInstanceId?: string;
  location: number;
  lockable: boolean;
  quantity: number;
  state: number;
  transferStatus: number;

  // Runtime variables
  characterIndex: number;
  filteredOut: boolean;
  itemComponentData: InventoryItemStatsBase; // Populated from ComponentTypes.ItemInstances
  itemValue: DestinyInventoryItemDefinition;
  repValue: number; // Exists in faction rep only
  selected: boolean;
  transferQuantity: number;
}

export interface InventoryItemStatsBase {
  damageType: number;
  damageTypeHash: number;
  primaryStat: Stat3;
  itemLevel: number;
  quality: number;
  isEquipped: boolean;
  canEquip: boolean;
  equipRequiredLevel: number;
  unlockHashesRequiredToEquip: number[];
  cannotEquipReason: number;

  // Runtime variables
  damageTypeValue: DestinyDamageTypeDefinition;

}