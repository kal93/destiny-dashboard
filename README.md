![destiny dashboard](https://destinydashboard.net/favicon.ico "Destiny Dashboard")

# Goals
- Create a collection of professionally developed high quailty, performant, and reusable tools for a Destiny player.

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
## Destiny Dashboard Platform
- [x] App Engine, Cloud SQL, Cloudflare
- [x] Bungie OAuth
- [x] Shared Manifest
- [x] Shared application level Http caching
- [x] Cards base class
- [x] Stackdriver logging
- [ ] Add Card should show how many users have it installed
- [ ] Ability for users to subscribe to push notifications for different cards
- [ ] Add Cordova wrapper and push to iOS and Android stores
- [ ] Localization to support all languages supported by the Manifest


## Cards
- [x] Reddit
- [x] Twitch
- [x] Countdown
- [x] Stats
- [x] Bungie News (Weekly Update, blogs)
- [ ] ITEM TRANSFER
- [ ] Xur
- [ ] Grimoire
- [ ] PvP realtime analysis
    - Detect current in-game opponents and show commons stats like K/D, Favorite subclass or super, most used weapons
- [ ] Quest Lines 
- [ ] Checklist
    - Has user completed the Daily, Weekly, Raids, Nightfall?
- [ ] Game History Browser
- [ ] Destiny Dashboard News
- [ ] LFG/ Team finder with scheduling
- [ ] Public Events ?
- [ ] Dead Ghosts ?
- [ ] Clan support ?
- [ ] Your Idea Here


## References
1. [Bungie API](https://destiny-db.appspot.com/api/)
2. [Reddit](https://www.reddit.com/r/DestinyDashboard/)
3. [Discord](https://discord.gg/A5fPSTa)
4. [Bungie User Endpoints](https://www.bungie.net/platform/User/help/)
5. [Bungie Destiny Endpoints](https://www.bungie.net/platform/destiny/help/)
6. [Angular 2+ SSL Info](http://brianflove.com/2016/10/22/angular-cli-using-https/)
