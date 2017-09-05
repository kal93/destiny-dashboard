export interface DestinyProgressionDefinition {
    displayProperties: DisplayProperties;
    'BungieNet.Engine.Contract.Destiny.World.Definitions.IDestinyDisplayDefinition.displayProperties': DisplayProperties;
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

interface DisplayProperties {
    displayUnitsName: string;
    description: string;
    name: string;
    icon: string;
    hasIcon: boolean;
}