import { DestinyMembership } from "app/bungie/services/interface.barrel";

export interface IGroupV2 {
  detail: GroupV2Detail;
  founder: GroupV2Member;
  allidIds: Array<any>;
  allianceStatus: number;
  groupJoinInvitecount: number;
  currentUserMemberMap: any;
  currentUserPotentialMemberMap: any;
}

export interface GroupV2Detail {
  groupId: number;
  name: string;
  groupType: number;
  membershipIdCreated: number;
  creationDate: string;
  modificationdate: string;
  about: string;
  tags: Array<string>;
  memberCount: number;
  isPublic: boolean;
  isPublicTopicAdminOnly: boolean;
  primaryAlliedGroupId: string;
  motto: string;
  allowChat: boolean;
  isDefaultPostPublic: boolean;
  chatSecurity: number;
  homepage: number;
  membershipOption: number;
  defaultPublicity: number;
  theme: string;
  bannerPath: string;
  avatarPath: string;
  isAllianceOwner: boolean;
  conversationId: number;
  enableInvitationMessingForAdmins: boolean;
  banExpireDate: string;
  features: GroupV2DetailFeatures;
  clanInfo: GroupV2DetailClanInfo;
}

export interface GroupV2Member {
  memberType: number;
  isOnline: boolean;
  groupId: number;
  destinyUserInfo: DestinyMembership;
  bungieNetUserInfo: DestinyMembership;
  joinDate: string;
}

interface GroupV2DetailFeatures {
  maximumMembers: number;
  maximumMembershipsOfGroupType: number;
  capabilities: number;
  MembershipTypes: Array<number>;
  invitePermissionOverride: boolean;
  updateCulturePermissionOverride: boolean;
  updateBannerPermissionOverride: boolean;
  joinLevel: number;
}

interface GroupV2DetailClanInfo {
  d2ClanProgressions: any;
  clanCallsign: string;
  clanBannerData: GroupV2DetailClanInfoClanBannerData;
}

interface GroupV2DetailClanInfoClanBannerData {
  decalId: number;
  decalColorId: number;
  decalBackgroundColorId: number;
  gonfalonId: number;
  gonfalonColorId: number;
  gonfalonDetailId: number;
  gonfalonDetailColorId: number;

}