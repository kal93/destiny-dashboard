
export interface INews {
    results: INewsResult[];
    totalResults: number;
    hasMore: boolean;
    query: Query;
    useTotalResults: boolean;
}

interface Query {
    tags: string[];
    contentType: string;
    itemsPerPage: number;
    currentPage: number;
}

export interface INewsResult {
    contentId: string;
    cType: string;
    cmsPath: string;
    creationDate: string;
    modifyDate: string;
    allowComments: boolean;
    hasAgeGate: boolean;
    minimumAge: number;
    ratingImagePath: string;
    author: Author;
    autoEnglishPropertyFallback: boolean;
    properties: Properties;
    representations: any[];
    tags: string[];

    //Runtime variable
    clicked: boolean;
}

interface Properties {
    Title: string;
    Subtitle: string;
    Summary: string;
    Content: string;
    FrontPageBanner: string;
    ArticleBanner: string;
    MobileTitle: string;
    Thumbnail: string;
    Video: string;
    MobileBanner: string;
    FrontPageBannerVideoWebM: string;
    FrontPageBannerVideoMp4: string;
}

interface Author {
    membershipId: string;
    uniqueName: string;
    displayName: string;
    profilePicture: number;
    profileTheme: number;
    userTitle: number;
    successMessageFlags: string;
    isDeleted: boolean;
    about: string;
    firstAccess: string;
    lastUpdate: string;
    psnDisplayName: string;
    xboxDisplayName: string;
    showActivity: boolean;
    locale: string;
    localeInheritDefault: boolean;
    showGroupMessaging: boolean;
    profilePicturePath: string;
    profileThemeName: string;
    userTitleDisplay: string;
    statusText: string;
    statusDate: string;
}