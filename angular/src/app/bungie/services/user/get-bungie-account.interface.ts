import { DestinyMembership, BungieNetUser } from "../user/user.interface";
import { LevelProgression } from "../interface.barrel";

export interface IGetBungieAccount {
    destinyAccounts: DestinyAccount[];
    bungieNetUser: BungieNetUser;
    clans: BungieAccountClan[];
    relatedGroups: any;
    destinyAccountErrors: DestinyAccountError[];
}

interface DestinyAccount {
    userInfo: DestinyMembership;
    grimoireScore: number;
    characters: BungieAccountCharacter[];
    lastPlayed: string;
    versions: number;
}

export interface BungieAccountCharacter {
    characterId: string;
    raceHash: number;
    genderHash: number;
    classHash: number;
    emblemHash: number;
    race: BungieAccountRace;
    gender: BungieAccountGender;
    characterClass: BungieAccountCharacterClass;
    emblemPath: string;
    backgroundPath: string;
    level: number;
    powerLevel: number;
    dateLastPlayed: string;
    membershipId: string;
    membershipType: number;
    levelProgression: LevelProgression;
    isPrestigeLevel: boolean;
    genderType: number;
    classType: number;
    percentToNextLevel: number;
    currentActivityHash: number;
}

export interface BungieAccountRace {
    raceHash: number;
    raceType: number;
    raceName: string;
    raceNameMale: string;
    raceNameFemale: string;
    raceDescription: string;
    hash: number;
    index: number;
    redacted: boolean;
}

export interface BungieAccountGender {
    genderHash: number;
    genderType: number;
    genderName: string;
    genderDescription: string;
    hash: number;
    index: number;
    redacted: boolean;
}

export interface BungieAccountCharacterClass {
    classHash: number;
    classType: number;
    className: string;
    classNameMale: string;
    classNameFemale: string;
    classIdentifier: string;
    mentorVendorIdentifier: string;
    hash: number;
    index: number;
    redacted: boolean;
}

export interface BungieAccountClan {
    groupId: string;
    platformType: number;
}

export interface BungieGroupInfo {
    groupId: string;
    name: string;
    membershipIdCreated: string;
    creationDate: string;
    modificationDate: string;
    groupType: number;
    about: string;
    isDeleted: boolean;
    tags: string[];
    rating: number;
    ratingCount: number;
    memberCount: number;
    pendingMemberCount: number;
    isPublic: boolean;
    isMembershipClosed: boolean;
    isMembershipReviewed: boolean;
    isPublicTopicAdminOnly: boolean;
    primaryAlliedGroupId: string;
    motto: string;
    clanCallsign: string;
    allowChat: boolean;
    isDefaultPostPublic: boolean;
    isDefaultPostAlliance: boolean;
    chatSecurity: number;
    locale: string;
    avatarImageIndex: number;
    founderMembershipId: string;
    homepage: number;
    membershipOption: number;
    defaultPublicity: number;
    theme: string;
    bannerPath: string;
    avatarPath: string;
    isAllianceOwner: boolean;
    conversationId: string;
    clanReviewType: number;
    enableInvitationMessagingForAdmins: boolean;
    banExpireDate: string;
}

export interface DestinyAccountError {
    errorCode: number;
    message: string;
    membershipType: number;
    membershipId: string;
    displayName: string;
}
