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
    primaryStat?: PrimaryStat;
}

interface PrimaryStat {
    statHash: number;
    value: number;
    maximumValue: number;
}
