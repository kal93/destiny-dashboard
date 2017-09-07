
export enum ClassTypes {
    TITAN = 0,
    HUNTER = 1,
    WARLOCK = 2,
    UNKNOWN = 3
}

export enum ComponentTypes {
    None = 0,
    Profiles = 100,
    //Profiles is the most basic component, only relevant when calling GetProfile.This returns basic information about the profile, which is almost nothing= a listof characterIds, some information about the last time you logged in, and that mostsobering statistic= how long you've played.
    VendorReceipts = 101,
    // Only applicable for GetProfile, this will return information about receipts for refundablevendor items.
    ProfileInventories = 102,
    //Asking for this will get you the profile-level inventories, such as your Vault buckets(yeah, the Vault is really inventory buckets located on your Profile)
    ProfileCurrencies = 103,
    //This will get you a summary of items on your Profile that we consider to be "currencies",such as Glimmer. I mean, if there's Glimmer in Destiny 2. I didn't say there was Glimmer.
    Characters = 200,
    //This will get you summary info about each of the characters in the profile.
    CharacterInventories = 201,
    //This will get you information about any non-equipped items on the character or character(s)in question, if you're allowed to see it. You have to either be authenticated as that user,or that user must allow anonymous viewing of their non-equipped items in Bungie.Net settingsto actually get results.
    CharacterProgressions = 202,
    //This will get you information about the progression (faction, experience, etc... "levels")relevant to each character, if you are the currently authenticated user or the user haselected to allow anonymous viewing of its progression info.
    CharacterRenderData = 203,
    //This will get you just enough information to be able to render the character in 3Dif you have written a 3D rendering library for Destiny Characters, or "borrowed" ours.It's okay, I won't tell anyone if you're using it. I'm no snitch.(actually, we don't care if you use it - go to town)
    CharacterActivities = 204,
    //This will return info about activities that a user can see and gating on it, if you are the currently authenticated user or the user haselected to allow anonymous viewing of its progression info.Note that the data returned by this can be unfortunately problematic and relatively unreliable insome cases. We'll eventually work on making it more consistently reliable.
    CharacterEquipment = 205,
    //This will return info about the equipped items on the character(s). Everyone can see this.
    ItemInstances = 300,
    //This will return basic info about instanced items - whether they can be equipped, theirtracked status, and some info commonly needed in many places (current damage type,primary stat value, etc)
    ItemObjectives = 301,
    //Items can have Objectives (DestinyObjectiveDefinition) bound to them. If they do, this willreturn info for items that have such bound objectives.
    ItemPerks = 302,
    //Items can have perks (DestinyPerkDefinition). If they do, this will return info forwhat perks are active on items.
    ItemRenderData = 303,
    // If you just want to render the weapon, this is just enough info to do that rendering.
    ItemStats = 304,
    //Items can have stats, like rate of fire. Asking for this component will returnrequested item's stats if they have stats.
    ItemSockets = 305,
    // Items can have sockets, where plugs can be inserted. Asking for this component willreturn all info relevant to the sockets on items that have them.
    ItemTalentGrids = 306,
    //Items can have talent grids, though that matters a lot less frequently than it used to.Asking for this component will return all relevant info about activated Nodes and Stepson this talent grid, like the good ol' days.
    ItemCommonData = 307,
    //Items that *aren't* instanced still have important information you need to know=how much of it you have, the itemHash so you can look up their DestinyInventoryItemDefinition,whether they're locked, etc... Both instanced and non-instanced items will have these properties.
    ItemPlugStates = 308,
    // Items that are "Plugs" can be inserted into sockets. This returns statuses about those plugsand why they can/can't be inserted. I hear you giggling, there's nothing funny about inserting plugs.Get your head out of the gutter and pay attention!
    Vendors = 400,
    VendorCategories = 401,
    VendorSales = 402,
    Kiosks = 500
    // Asking for this component will return you the account's Kiosk statuses= that is, what items have been filledout/acquired. But only if you are the currently authenticated user or the user haselected to allow anonymous viewing of its progression info.
}

export enum ItemSubTypes {
    NONE = 0,
    CRUCIBLE = 1,
    VANGUARD = 2,
    IRONBANNER = 3,
    QUEEN = 4,
    EXOTIC = 5,
    AUTORIFLE = 6,
    SHOTGUN = 7,
    MACHINEGUN = 8,
    HANDCANNON = 9,
    ROCKETLAUNCHER = 10,
    FUSIONRIFLE = 11,
    SNIPERRIFLE = 12,
    PULSERIFLE = 13,
    SCOUTRIFLE = 14,
    CAMERA = 15,
    CRM = 16,
    SIDEARM = 17,
    SWORD = 18,
    MASK = 19
}

export enum ItemTypes {
    None = 0,
    Currency = 1,
    Armor = 2,
    Weapon = 3,
    Bounty = 4,
    CompletedBounty = 5,
    BountyReward = 6,
    Message = 7,
    Engram = 8,
    Consumable = 9,
    ExhangeMaterial = 10,
    MissionReward = 11,
    QuestStep = 12,
    QuestStepComplete = 13,
    Emblem = 14,
    Quest = 15,
    Subclass = 16,
    ClanBanner = 17,
    Aura = 18,
    Mod = 19
}


export enum GroupTypes {
    GENERAL = "General",
    WEAPONS = "Weapons",
    MEDALS = "Medals"
}

export enum PeriodTypes {
    DAILY = "Daily",
    ALLTIME = "AllTime",
    ACTIVITY = "Activity"
}

export enum PrivacyTypes {
    None = 0,
    Public = 1,
    Private = 2,
}

export enum MilestoneTypes {
    Unknown = 0,
    Tutorial = 1,  //One-time milestones that are specifically oriented toward teaching players about new mechanics andgameplay modes.
    OneTime = 2,
    Weekly = 3,
    Daily = 4,
    Special = 5 //Special indicates that the event is not on a daily/ weekly cadence, but does occur more than once.For instance, Iron Banner in Destiny 1 or the Dawning were examples of what could be termed "Special"events.
}

export enum ModeTypes {
    NONE = 0,
    STORY = 2,
    STRIKE = 3,
    RAID = 4,
    ALLPVP = 5,
    PATROL = 6,
    ALLPVE = 7,
    PVPINTRODUCTION = 8,
    THREEVSTHREE = 9,
    CONTROL = 10,
    LOCKDOWN = 11,
    TEAM = 12,
    FREEFORALL = 13,
    TRIALSOFOSIRIS = 14,
    DOUBLES = 15,
    NIGHTFALL = 16,
    HEROIC = 17,
    ALLSTRIKES = 18,
    IRONBANNER = 19,
    ALLARENA = 20,
    ARENA = 21,
    ARENACHALLENGE = 22,
    ELIMINATION = 23,
    RIFT = 24,
    ALLMAYHEM = 25,
    MAYHEMCLASH = 26,
    MAYHEMRUMBLE = 27,
    ZONECONTROL = 28,
    RACING = 29,
    ARENAELDERCHALLENGE = 30,
    SUPREMACY = 31,
    PRIVATEMATCHESALL = 32,
    SUPREMACYRUMBLE = 33,
    SUPREMACYCLASH = 34,
    SUPREMACYINFERNO = 35,
    SUPREMACYMAYHEM = 36
}

export enum NewsTypes {
    ALL = "all",
    BUNGIE = "bungie",
    COMMUNITY = "community",
    DESTINY = "destiny",
    UPDATES = "updates"
}

export enum TierTypes {
    UNKNOWN = 0,
    CURRENCY = 1,
    BASIC = 2,
    COMMON = 3,
    RARE = 4,
    LEGENDARY = 5,
    EXOTIC = 6
}

export enum TimeSpan {
    SECONDS_1 = 1000,
    SECONDS_30 = 1000,

    MINUTES_1 = 60000,
    MINUTES_2 = 120000,
    MINUTES_10 = 600000
}

