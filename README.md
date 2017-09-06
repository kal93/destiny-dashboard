![destiny dashboard](https://www.destinydashboard.net/favicon.ico "Destiny Dashboard")

# Goals
- Create a collection of professionally developed, high quailty, and performant tools for a Destiny player.

- Inspire a community collaboration where members teach and learn cutting edge web development.

- Have fun :)

# Vision

No more jumping to 6 different websites to check your stats, grimoire, dead ghosts, item transferring, public events, news, etc.

This project will emphasize performance and use cutting edge web development practices. Service Workers, HTTP level caching, AoT compiling, and efficient Manifest parsing are already included in the project.

# Dashboard
A user can create multiple dashboards. Dashboards consist of one or more cards. Cards can be added, removed, resized, and moved. Users can modify their dashboard as they please, and their changes will be linked to their Bungie account.

# Cards
There are two types of cards.
1. Internal cards, which have a fullscreen mode. (Stats card for example)
2. External cards, which do not have a fullscreen mode. (Reddit card for example)


# Development Setup
There are 4 main setup steps for this project.

1. [Angular 4 Material](https://github.com/lax20attack/destiny-dashboard/wiki/Angular-4-Setup)
2. [Google App Engine Java](https://github.com/lax20attack/destiny-dashboard/wiki/Google-App-Engine-Java-Setup) *Optional
3. [MySQL Database](https://github.com/lax20attack/destiny-dashboard/wiki/MySQL-Database-Setup) *Optional
4. [Bungie API](https://github.com/lax20attack/destiny-dashboard/wiki/Bungie-API-Setup) *Optional

Step 1 will set up the front-end Angular code which is the majority of the application. Out of the box, the Angular code is pointing to a test app engine server and MySQL database. 

You only need to do steps 2, 3 & 4 if you are working on the Java API.


# Todo
## Platform
- [ ] Add Card should show how many users have it installed
- [ ] Add Card should have filter by card types
- [ ] Add Card should have arrows to navigate cards on desktop version
- [ ] Ability for users to subscribe to push notifications for different cards
- [ ] Add Cordova wrapper and push to iOS and Android stores
- [ ] Localization to support all languages supported by the Manifest


## New Cards
- [ ] PvP realtime analysis
    - Detect current in-game opponents and show commons stats like K/D, Favorite subclass or super, most used weapons
- [ ] Quest Lines 
- [ ] Checklist
    - Has user completed the Daily, Weekly, Raids, Nightfall?
- [ ] Game History Browser
- [ ] LFG/ Team finder with scheduling
- [ ] Xur ?
- [ ] Public Events ?
- [ ] Dead Ghosts ?
- [ ] Clan support ?


## Existing Card Enhancements
- [ ] Inventory Popup should have more detail
- [ ] Database Popup should have more detail
- [ ] Database should sort by columns
- [ ] Database should filter by item tier (Common, Rare, Legendary, Exotic)


## References
1. [Reddit](https://www.reddit.com/r/DestinyDashboard/)
2. [Discord](https://discord.gg/A5fPSTa)
3. [Bungie User Endpoints](https://www.bungie.net/platform/User/help/)
4. [Bungie Destiny 2 Endpoints](https://www.bungie.net/platform/Destiny2/help/)