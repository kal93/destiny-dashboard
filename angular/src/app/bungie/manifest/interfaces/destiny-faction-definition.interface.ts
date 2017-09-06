import { DisplayProperties } from "../../services/destiny/shared.interface";

export interface DestinyFactionDefinition {
    displayProperties: DisplayProperties;
    progressionHash: number;
    hash: number;
    index: number;
    redacted: boolean;
}