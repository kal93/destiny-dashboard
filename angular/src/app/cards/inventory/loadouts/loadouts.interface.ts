import { InventoryItem } from 'app/bungie/services/interface.barrel';

export interface ILoadoutResponse {
    name: string;
    itemIds: Array<string>;
}

export interface Loadout {
    name: string;
    inventoryItems: Array<InventoryItem>;
} 