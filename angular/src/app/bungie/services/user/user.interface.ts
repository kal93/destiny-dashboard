export enum DestinyMembershipType {
    NONE = 0,
    TIGERXBOX = 1,
    TIGERPSN = 2,
    TIGERBLIZZARD = 4,
    TIGERDEMON = 10
}

export interface IMembershipsForCurrentUser {
    destinyMemberships: DestinyMembership[];
    bungieNetUser: BungieNetUser;
}

export interface DestinyMembership {
    iconPath: string;
    membershipType: number;
    membershipId: string;
    displayName: string;
}

export interface BungieNetUser {
    membershipId: string;
    uniqueName: string;
    displayName: string;
    profilePicture: number;
    profileTheme: number;
    userTitle: number;
    successMessageFlags: string;
    isDeleted: boolean;
    about: string;
    firstAccess: Date;
    lastUpdate: Date;
    context: Context;
    showActivity: boolean;
    locale: string;
    localeInheritDefault: boolean;
    showGroupMessaging: boolean;
    profilePicturePath: string;
    profileThemeName: string;
    userTitleDisplay: string;
    statusText: string;
    statusDate: Date;
}

export interface Context {
    isFollowing: boolean;
    ignoreStatus: IgnoreStatus;
}

export interface IgnoreStatus {
    isIgnored: boolean;
    ignoreFlags: number;
}