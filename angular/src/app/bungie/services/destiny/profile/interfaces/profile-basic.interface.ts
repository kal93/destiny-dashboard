export interface ProfileBasic {
    profile: Profile;
    itemComponents: ItemComponents;
}

interface ItemComponents {
}

interface Profile {
    data: Data;
    privacy: number;
}

interface Data {
    userInfo: UserInfo;
    dateLastPlayed: string;
    versionsOwned: number;
    characterIds: string[];
}

interface UserInfo {
    membershipType: number;
    membershipId: string;
    displayName: string;
}