import { DisplayProperties } from "app/bungie/services/destiny/shared.interface";

export interface DestinyMilestoneDefinition {
    displayProperties: DisplayProperties;
    friendlyName: string;
    hash: number;
    hasPredictableDates: boolean;
    index: number;
    isInGameMilestone: boolean;
    milestoneType: number;
    quests: { [key: number]: QuestsBase };
    recruitable: boolean;
    redacted: boolean;
    showInExplorer: boolean;
}

interface QuestsBase {
    displayProperties: DisplayProperties;
    questItemHash: number;
    questRewards: QuestRewards;
    trackingUnlockValueHash: number;
}

export interface QuestRewards {
    items: Item[];
}

interface Item {
    itemHash: number;
    quantity: number;
    vendorHash: number;
    vendorItemIndex: number;
}