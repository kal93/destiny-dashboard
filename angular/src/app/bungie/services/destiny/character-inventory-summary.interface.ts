import { Currency } from "./_shared.interface";
import { InventoryItem } from "./inventory-item.interface";

export interface ICharacterInventorySummary {
  items: InventoryItem[];
  currencies: Currency[];
}