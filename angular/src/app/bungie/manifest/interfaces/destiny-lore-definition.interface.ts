import { DisplayProperties } from "app/bungie/services/destiny/shared.interface";

export interface DestinyLoreDefinition {
    displayProperties: DisplayProperties;
    subtitle: string;
    hash: number;
    index: number;
    redacted: boolean;
}