import { Stat3 } from "./_shared.interface";
import { InventoryItem } from "./manifest/inventory-item.interface";

export interface IVaultSummary {
    items: VaultItem[];
}

export interface VaultItem {
    itemHash: number;
    itemId: string;
    quantity: number;
    damageType: number;
    damageTypeHash: number;
    isGridComplete: boolean;
    transferStatus: number;
    state: number;
    characterIndex: number;
    bucketHash: number;
    primaryStat?: Stat3;

    // Runtime variables
    itemValue: InventoryItem;
    damageTypeValue: any;
}

export interface Bucket {
    hash: number;
    bucketValue: any;
    items: Array<VaultItem>;
}