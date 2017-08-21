import { Stat3 } from "./_shared.interface";
import { DestinyDamageTypeDefinition, DestinyInventoryBucketDefinition, DestinyInventoryItemDefinition } from "../../manifest/interfaces";

export interface InventoryBucket {
  bucketValue: DestinyInventoryBucketDefinition;
  hash: number;
  items: Array<InventoryItem>;

  // Runtime variables
  filteredOut: boolean;
}

export interface InventoryItem {
  bucketHash: number;
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
  characterIndex: number;
  damageTypeValue: DestinyDamageTypeDefinition;
  filteredOut: boolean;
  itemValue: DestinyInventoryItemDefinition;
  selected: boolean;
}