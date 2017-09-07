import { DisplayProperties } from "app/bungie/services/destiny/shared.interface";

export interface DestinyProgressionDefinition {
    displayProperties: DisplayProperties;
    scope: number;
    repeatLastStep: boolean;
    steps: Step[];
    visible: boolean;
    factionHash: number;
    progressToNextStepScaling: number;
    storageMappingIndex: number;
    hash: number;
    index: number;
    redacted: boolean;
}

interface Step {
    stepName: string;
    displayEffectType: number;
    progressTotal: number;
    rewardItems: any[];
}
