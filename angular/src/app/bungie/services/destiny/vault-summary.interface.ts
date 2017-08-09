import { Stat3 } from "./_shared.interface";
import { InventoryItem } from "./manifest/inventory-item.interface";

export interface IVaultSummary {
    items: VaultItem[];
}

export interface VaultItem {
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

export interface Bucket {
    hash: number;
    bucketValue: any;
    items: Array<VaultItem>;
}