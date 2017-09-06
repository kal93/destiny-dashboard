import { DisplayProperties } from "../../services/destiny/shared.interface";

export interface DestinyInventoryBucketDefinition {
    displayProperties: DisplayProperties;
    scope: number;
    category: number;
    bucketOrder: number;
    itemCount: number;
    location: number;
    hasTransferDestination: boolean;
    enabled: boolean;
    fifo: boolean;
    hash: number;
    index: number;
    redacted: boolean;
}