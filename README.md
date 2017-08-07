![destiny dashboard](https://destinydashboard.net/favicon.ico "Destiny Dashboard")


# Vision
This site will have every tool a Destiny player might need. No more jumping to 6 different websites to check your stats, grimoire, dead ghosts, item transferring, public events, news, etc.

This project will emphasize performance and cutting edge web development practices. Service Workers, HTTP level caching, AoT compiling, and efficient Manifest parsing are already included in the project.

Search the repository for [HOW TO] for commits that serve as a guide on how to implement something. For example, there is a commit named [[HOW TO] [Add a new card]](https://github.com/lax20attack/destiny-dashboard/commit/a7c0e9b8cde5e71355cba404137afb39f68f5ac8)  that shows every piece of code needed to create a new card.

# Dashboard
A user can create multiple dashboards. Dashboards consist of one or more cards. The dashboard is the main interface for the application. Users can modify their dashboard as they please, and their changes will persist across devices and be linked to their Bungie account.

# Cards
There are two types of cards.
1. Internal cards, which have a fullscreen mode. (Stats card for example) 
2. External cards, which do not have a fullscreen mode. (Reddit card for example). 


# DestinyDashboard Development Setup
There are 4 main setup steps for this project. Total setup time about 20 minutes.

1. [Angular 4 Material](#angular-4-material-setup)
2. [Google App Engine Java](#google-app-engine-java-setup) *Optional
3. [MySQL Database](#mysql-database-setup) *Optional
4. [Bungie API](#bungie-api-setup) *Optional


## Angular 4 Material Setup
1. Clone repository

2. Install [Visual Studio Code](https://code.visualstudio.com/download) and the following extensions:
    - [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)
    - [Style formatter](https://marketplace.visualstudio.com/items?itemName=dweber019.vscode-style-formatter)

3. Install [node.js](https://nodejs.org/en/download/)

4. Install the localhost certs to Trusted Root. We need SSL to communicate with Bungie's servers.
    - Double click `\angular\ssl\ca.crt to install` install to Trusted Root.

5. Copy and rename `\angular\src\environments\environment.prod.template.ts` to `environment.prod.ts`.

6. Copy and rename `\angular\src\environments\environment.template.ts` to `environment.prod.ts`.

7. In VS Code, File-> Open Folder to the `angular` subdirectory in the root of the repo.

8. Open the terminal and run the following commands.
    - `npm install @angular/cli -g`
    - `npm install`

    You should now be able to run with `npm start`. Navigate to [https://localhost:4201/](https://localhost:4201/)

You are now running Destiny Dashboard locally. You are also hitting a test API server. You do not have to continue the rest of the setup if you only want to work on front end code.


## Google App Engine Java Setup 

* This step is optional if you only want to focus on Angular development. A test server has been set up for backend API. If you want to make API changes, you will have to follow this step.

 For the following, make sure you follow the same architecture. If you download 32 bit Eclipse, use 32 bit JRE and JDK.

1. [Download Java 7 JDK](http://www.oracle.com/technetwork/java/javase/downloads/java-archive-downloads-javase7-521261.html)
2. [Download Java JRE 8](http://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html)  (Note- Do not uninstall v7. We need v7 for App Engine, but v8 for Eclipse)
 
3. [Follow the Quickstart](https://cloud.google.com/eclipse/docs/quickstart)
    - For Eclipse, download 'Eclipse IDE for Java Developers'
4. Point Eclipse to the `java\` in the root directory of the repository.
5. Copy `java\src\main\webapp\WEB-INF\appengine-web.template.xml` to `java\src\main\webapp\WEB-INF\appengine-web.xml`. `appengine-web.xml` is where we store our Database credentials and Bungie OAuth secret keys. This file is excluded from the repository because it has sensitive information. You should not share your `appengine-web.xml` file.


## MySQL Database Setup

* This step is optional if you only want to focus on Angular development. A test server has been set up for backend API. If you want to make API changes, you will have to follow this step.

1. Create your own MySQL instance. You can [download and install MySQL](https://www.mysql.com/downloads/), or run an instance on Google App Engine or AWS.
2. Run `database\CREATE DATABASE.sql`.
3. Update `java\src\main\webapp\WEB-INF\appengine-web.xml` with your connection string info.


## Bungie API Setup

1. The repository comes with test API keys. You do not have to create API keys right now.
   
   How to create your own API keys (optional):
    1. Create a new app on [Bungie.net](https://www.bungie.net/en/Application).

    2. Name it and give it a website. You can use DestinyDashboard.net.

    3. Create an API Key if one does not exist.

    4. Select `confidential` OAuth Client Type.

    5. Use `https://localhost:4201/` for the Redirect URL.

    6. Include all permissions for Scope.

    7. Use `https://localhost:4201` for the Origin Header.

    8.  In Angular, replace apiKey and bungieClientId in `\angular\src\environments\environment.ts`.
        
    9. In Java, rename `\java\src\main\webapp\WEB-INF\appengine-web.template.xml` to `appengine-web.template.xml` 



## Platform todo List
- [x] App Engine, Cloud SQL, Cloudflare
- [x] Bungie OAuth
- [x] Shared Manifest
- [x] Shared Http caching
- [x] Cards base class
- [x] Stackdriver logging
- [ ] Add Card should show how many users have it installed
- [ ] Ability for users to subscribe to push notifications for different cards
- [ ] Add Cordova wrapper and push to iOS and Android stores
- [ ] Localization to support all languages supported by the Manifest


## Cards Todo list
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

## Known issues
- [ ] Safari Display issues for image in Countdown card



## References
1. [Bungie API](https://destiny-db.appspot.com/api/)
2. [Reddit](https://www.reddit.com/r/DestinyDashboard/)
3. [Discord](https://discord.gg/A5fPSTa)
4. [Bungie User Endpoints](https://www.bungie.net/platform/User/help/)
5. [Bungie Destiny Endpoints](https://www.bungie.net/platform/destiny/help/)
6. [Angular 2+ SSL Info](http://brianflove.com/2016/10/22/angular-cli-using-https/)