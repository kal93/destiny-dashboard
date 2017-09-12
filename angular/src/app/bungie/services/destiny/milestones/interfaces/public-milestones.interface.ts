export interface IPublicMilestones {
    Response: { [key: number]: PublicMilestoneBase[] };
    ErrorCode: number;
    ThrottleSeconds: number;
    ErrorStatus: string;
    Message: string;
    MessageData: MessageData;
}

interface MessageData {
}

export interface PublicMilestoneBase {
    availableQuests: AvailableQuest[];
    milestoneHash: number;
    startDate: string;
    endDate: string;
}

interface AvailableQuest {
    questItemHash: number;
    activity: Activity;
    challenges: Challenge[];
}

interface Challenge {
    objectiveHash: number;
    activityHash: number;
}

interface Activity {
    activityHash: number;
    modifierHashes: number[];
    variants: Variant[];
}

interface Variant {
    activityHash: number;
}

