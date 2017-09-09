import { ICard, IUserDashboard } from './card.interface';

export interface ICardDefinition {
    enabled: boolean; // If card should be shown in add card or on the dashboard
    categories: Array<string>; // What categories does this card belong to
    id: number;  //Unique ID of the card
    title: string;  //Title of the card
    description: string;  //Short description of the card
    rating: number;  //Rating generated by the community
    route: string; //Fullscreen internal route, or external href
    isExternalRoute: boolean; //Is the route internal or external
    lastUpdated: number; //epoch time (Ex new Date().getTime()) when the card was last updated
    layouts: Array<{ rows: number, cols: number }>; //Supported layouts (1x1, 2x1, 3x3, etc) Max Columns is 3
    requiresLogin: boolean; //User must be logged in to Bungie API in order to use this card
    previewImageClass: string; //Image for preview, used in AddCardComponent
}

export class CardDefinitions {
    // When removing cards, replace the card definition with null
    static definitions: Array<ICardDefinition> =
    [{
        enabled: false, categories: ["Other"],
        id: 0, title: "Countdown", description: "Destiny 2 countdown", rating: 5, route: "/countdown",
        //Sort layouts by column, then row
        layouts: [
            { rows: 1, cols: 1 },
            { rows: 1, cols: 2 }, { rows: 2, cols: 2 },
            { rows: 1, cols: 3 }, { rows: 2, cols: 3 }
        ],
        requiresLogin: false, isExternalRoute: false, lastUpdated: 1497057903904, previewImageClass: "dd-countdown-preview",
    },
    {
        enabled: true, categories: ["Stats"],
        id: 1, title: "Stats", description: "A summary of character stats", rating: 5, route: "/stats",
        layouts: [
            { rows: 2, cols: 2 }, { rows: 3, cols: 2 }, { rows: 4, cols: 2 },
            { rows: 2, cols: 3 }, { rows: 3, cols: 3 }, { rows: 4, cols: 3 }
        ],
        requiresLogin: false, isExternalRoute: false, lastUpdated: 1497057974086, previewImageClass: "dd-stats-preview"
    },
    {
        enabled: true, categories: ["News"],
        id: 2, title: "Reddit", description: "A preview of what's happening on /r/DestinyTheGame", rating: 5, route: "https://www.reddit.com/r/destinythegame/",
        layouts: [
            { rows: 2, cols: 1 },
            { rows: 2, cols: 2 },
            { rows: 2, cols: 3 }, { rows: 3, cols: 3 }
        ],
        requiresLogin: false, isExternalRoute: true, lastUpdated: 1497057959790, previewImageClass: "dd-reddit-preview"
    },
    {
        enabled: true, categories: ["Stats"],
        id: 3, title: "Reputation", description: "View character reputation", rating: 5,
        route: "/reputation",
        layouts: [
            { rows: 2, cols: 2 }, { rows: 3, cols: 2 },
            { rows: 2, cols: 3 }, { rows: 3, cols: 3 }
        ],
        requiresLogin: false, isExternalRoute: false, lastUpdated: 1503951147138, previewImageClass: "dd-reputation-preview"
    },
    {
        enabled: true, categories: ["News"],
        id: 4, title: "Twitch", description: "Popular Destiny Twitch streams", rating: 5, route: "https://www.twitch.tv/directory/game/Destiny",
        layouts: [
            { rows: 2, cols: 1 }, { rows: 3, cols: 1 },
            { rows: 2, cols: 2 }, { rows: 3, cols: 2 },
            { rows: 2, cols: 3 }, { rows: 3, cols: 3 }
        ],
        requiresLogin: false, isExternalRoute: true, lastUpdated: 1497058159790, previewImageClass: "dd-twitch-preview"
    },
    {
        enabled: true, categories: ["News"],
        id: 5, title: "Bungie News", description: "The latest news from Bungie.net", rating: 5, route: "https://www.bungie.net/en/News",
        layouts: [
            { rows: 2, cols: 2 }, { rows: 3, cols: 2 },
            { rows: 2, cols: 3 }, { rows: 3, cols: 3 }, { rows: 4, cols: 3 }
        ],
        requiresLogin: false, isExternalRoute: true, lastUpdated: 1501718581327, previewImageClass: "dd-bungie-news-preview"
    },
    {
        enabled: true, categories: ["Other"],
        id: 6, title: "Inventory", description: "Manage your vault and inventories, and create custom loadouts.", rating: 5, route: "inventory",
        layouts: [
            { rows: 3, cols: 3 }, { rows: 4, cols: 3 }
        ],
        requiresLogin: true, isExternalRoute: false, lastUpdated: 1502124275046, previewImageClass: "dd-inventory-preview"
    },
    {
        enabled: true, categories: ["Stats"],
        id: 7, title: "Clan Leaderboards", description: "View clan leaderboards", rating: 5, route: "clan-leaderboards",
        layouts: [
            { rows: 2, cols: 2 }, { rows: 3, cols: 2 }, { rows: 4, cols: 2 },
            { rows: 2, cols: 3 }, { rows: 3, cols: 3 }, { rows: 4, cols: 3 }
        ],
        requiresLogin: false, isExternalRoute: false, lastUpdated: 1504903373372, previewImageClass: "dd-clan-leaderboards-preview"
    },
    {
        enabled: true, categories: ["News"],
        id: 8, title: "Dashboard News", description: "DestinyDashboard internal site news", rating: 5, route: "dashboard-news",
        layouts: [
            { rows: 2, cols: 2 }, { rows: 3, cols: 2 }, { rows: 4, cols: 2 },
            { rows: 2, cols: 3 }, { rows: 3, cols: 3 }
        ],
        requiresLogin: false, isExternalRoute: false, lastUpdated: 1503622407631, previewImageClass: "dd-dashboard-news-preview"
    },
    {
        enabled: true, categories: ["Other"],
        id: 9, title: "Database", description: "Database of every item in Destiny", rating: 5, route: "database",
        layouts: [
            { rows: 2, cols: 2 }, { rows: 3, cols: 2 }, { rows: 4, cols: 2 },
            { rows: 2, cols: 3 }, { rows: 3, cols: 3 }, { rows: 4, cols: 3 }
        ],
        requiresLogin: false, isExternalRoute: false, lastUpdated: 1504570852262, previewImageClass: "dd-database-preview"
    },
    {
        enabled: true, categories: ["Stats", "Other"],
        id: 10, title: "Milestones", description: "View milestone for a player", rating: 5, route: "milestones",
        layouts: [
            { rows: 2, cols: 2 }, { rows: 3, cols: 2 }, { rows: 4, cols: 2 },
            { rows: 2, cols: 3 }, { rows: 3, cols: 3 }, { rows: 4, cols: 3 }
        ],
        requiresLogin: false, isExternalRoute: false, lastUpdated: 1504570852262, previewImageClass: "dd-milestones-preview"
    }];

    static defaultDashboards: Array<IUserDashboard> = [{
        id: -1, name: "Developer Picks", cards: [
            { id: -1, sequence: 0, definitionId: 1, layoutId: 3, definition: CardDefinitions.definitions[1], layout: CardDefinitions.definitions[1].layouts[3] },
            { id: -2, sequence: 1, definitionId: 3, layoutId: 2, definition: CardDefinitions.definitions[3], layout: CardDefinitions.definitions[3].layouts[2] },
            { id: -3, sequence: 2, definitionId: 9, layoutId: 3, definition: CardDefinitions.definitions[9], layout: CardDefinitions.definitions[9].layouts[3] },
            { id: -4, sequence: 3, definitionId: 2, layoutId: 0, definition: CardDefinitions.definitions[2], layout: CardDefinitions.definitions[2].layouts[0] },
            { id: -5, sequence: 4, definitionId: 5, layoutId: 0, definition: CardDefinitions.definitions[5], layout: CardDefinitions.definitions[5].layouts[0] },
            { id: -6, sequence: 5, definitionId: 8, layoutId: 4, definition: CardDefinitions.definitions[8], layout: CardDefinitions.definitions[8].layouts[4] }
        ]
    }, {
        id: -2, name: "News", cards: [
            { id: -1, sequence: 0, definitionId: 5, layoutId: 3, definition: CardDefinitions.definitions[5], layout: CardDefinitions.definitions[5].layouts[3] },
            { id: -2, sequence: 1, definitionId: 4, layoutId: 0, definition: CardDefinitions.definitions[4], layout: CardDefinitions.definitions[4].layouts[0] },
            { id: -3, sequence: 2, definitionId: 2, layoutId: 1, definition: CardDefinitions.definitions[2], layout: CardDefinitions.definitions[2].layouts[1] },
            { id: -4, sequence: 3, definitionId: 8, layoutId: 2, definition: CardDefinitions.definitions[8], layout: CardDefinitions.definitions[8].layouts[2] }
        ]
    }];

    static initDashboardsFromAPI(userDashboards: Array<IUserDashboard>) {
        for (let i = 0; i < userDashboards.length; i++) {
            let userDashboard = userDashboards[i];
            //Validate user cards
            for (let j = 0; j < userDashboard.cards.length; j++) {
                let dashboardCard: ICard = userDashboard.cards[j];

                //Set a unique value for each card so we can reference it in the future
                dashboardCard.id = j;

                //Verify the card's definition still exists and assign it
                dashboardCard.definition = CardDefinitions.definitions[dashboardCard.definitionId];
                if (dashboardCard.definition == null) {
                    //If the card definition can't be found, remove this card
                    userDashboard.cards.splice(j, 1);
                    j--;
                    continue;
                }

                //Verify the card layout is still supported
                if (dashboardCard.layoutId >= dashboardCard.definition.layouts.length)
                    dashboardCard.layoutId = 0;

                dashboardCard.layout = dashboardCard.definition.layouts[dashboardCard.layoutId];
            }
        }

        return userDashboards;
    }
}