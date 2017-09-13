export interface DestinyObjectiveDefinition {
    displayProperties: DisplayProperties;
    unlockValueHash: number;
    completionValue: number;
    locationHash: number;
    allowNegativeValue: boolean;
    allowValueChangeWhenCompleted: boolean;
    isCountingDownward: boolean;
    valueStyle: number;
    progressDescription: string;
    perks: Perks;
    stats: Stats;
    hash: number;
    index: number;
    redacted: boolean;
}

interface Stats {
    style: number;
}

interface Perks {
    perkHash: number;
    style: number;
}

interface DisplayProperties {
    description: string;
    name: string;
    hasIcon: boolean;
}