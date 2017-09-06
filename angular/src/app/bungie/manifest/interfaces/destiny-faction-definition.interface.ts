import { DisplayProperties } from "../../services/destiny/shared.interface";

export interface DestinyFactionDefinition {
    displayProperties: DisplayProperties;
    hash: number;
    index: number;
    progressionHash: number;
    redacted: boolean;
}