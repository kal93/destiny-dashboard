export interface DestinyFactionDefinition {
    displayProperties: DisplayProperties;
    progressionHash: number;
    hash: number;
    index: number;
    redacted: boolean;
}

export interface DisplayProperties {
    description: string;
    name: string;
    icon: string;
    hasIcon: boolean;
}