import { InventoryItem } from 'app/bungie/services/interface.barrel'

export interface ILoadout {
    name: string;
    itemHashes: Array<number>;

    //Runtime variables
    inventoryItems?: Array<InventoryItem>;
}