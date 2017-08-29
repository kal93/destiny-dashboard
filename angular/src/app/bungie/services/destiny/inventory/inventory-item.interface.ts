import { Stat3 } from "../shared.interface";

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
  destCharacterIndex: number;
}

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