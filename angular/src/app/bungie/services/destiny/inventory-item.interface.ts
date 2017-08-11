import { Stat3 } from "./_shared.interface";
import { DestinyInventoryItemDefinition } from "../../manifest/interfaces";

export interface InventoryBucket {
  bucketValue: any;
  hash: number;
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
  itemValue: DestinyInventoryItemDefinition;
}
