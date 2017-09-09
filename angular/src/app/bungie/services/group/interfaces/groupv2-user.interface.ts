import { DestinyMembership, GroupV2Member, GroupV2Detail } from "app/bungie/services/interface.barrel";

export interface IGroupV2User {
  results: Array<GroupV2UserResults>;
  totalResults: number;
  hasMore: boolean;
  query: GroupV2UserQuery;
  useTotalResults: boolean;
}

interface GroupV2UserQuery {
  itemsPerPage: number;
  currentPage: number;
}

export interface GroupV2UserResults {
  member: GroupV2Member;
  group: GroupV2Detail;
}