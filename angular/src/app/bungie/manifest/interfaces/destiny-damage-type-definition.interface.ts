import { DisplayProperties } from "../../services/destiny/shared.interface";

export interface DestinyDamageTypeDefinition {
    displayProperties: DisplayProperties;
    transparentIconPath: string;
    showIcon: boolean;
    enumValue: number;
    hash: number;
    index: number;
    redacted: boolean;
}