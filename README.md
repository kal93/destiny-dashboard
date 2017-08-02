![destiny dashboard](https://destinydashboard.net/favicon.ico "Destiny Dashboard")


# DestinyDashboard
There are 4 main setup steps for this project. Total setup time about 15 minutes.

1. [Angular 4 Material](#angular-4-material-setup)
3. [Google App Engine Java](#google-app-engine-java-setup )
4. [MySQL Database](#mysql-database-setup)
2. [Bungie API](#bungie-api-setup)


## Angular 4 Material Setup
1. Clone repository

2. Install [Visual Studio Code](https://code.visualstudio.com/download) and the following extensions:
    - [Angular Language Service](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)
    - [Style formatter](https://marketplace.visualstudio.com/items?itemName=dweber019.vscode-style-formatter)

3. Install [node.js](https://nodejs.org/en/download/)

4. Install the localhost certs to Trusted Root. We need SSL to communicate with Bungie's servers.
    - Double click `\angular\ssl\ca.crt to install` install to Trusted Root.

5. In VS Code, File-> Open Folder to the `angular` subdirectory in the root of the repo.

6. Open the terminal and run the following commands.
    - `npm install @angular/cli -g`
    - `npm install`

    You should now be able to run with `npm start`. Navigate to [https://localhost:4201/](https://localhost:4201/)



## Google App Engine Java Setup 
1. [Download Java SE Development Kit 7u80](http://www.oracle.com/technetwork/java/javase/downloads/java-archive-downloads-javase7-521261.html)
2. [Follow the Quickstart](https://cloud.google.com/eclipse/docs/quickstart)
    - For Eclipse, download 'Eclipse IDE for Java Developers'
3. Point Eclipse to the `java\` in the root directory of the repository.
4. Copy `java\src\main\webapp\WEB-INF\appengine-web.template.xml` to `java\src\main\webapp\WEB-INF\appengine-web.xml`. `appengine-web.xml` is where we store our Database and Bungie OAuth information. This file is excluded from the repository because it has sensitive information. You should not share your `appengine-web.xml` file.


## MySQL Database Setup
1. Create your own MySQL instance. You can [download and install MySQL](https://www.mysql.com/downloads/), or run an instance on Google App Engine or AWS.
2. Run `database\CREATE DATABASE.sql`.
3. Update `java\src\main\webapp\WEB-INF\appengine-web.xml` with your connection string info.


## Bungie API Setup

1. Rename `\angular\src\environments\environment.prod-template.ts` to `environment.prod.ts`.

2. The repository comes with test API keys. You do not have to create API keys right now.
   
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


## Cards Todo list
- [x] Reddit
- [x] Twitch
- [x] Countdown
- [x] Stats
- [ ] Bungie News (Weekly Update, blogs)
- [ ] ITEM TRANSFER
- [ ] Xur
- [ ] Grimoire
- [ ] PvP realtime analysis
- [ ] Quest Lines 
- [ ] Weekly Checklist
- [ ] Game History Browser
- [ ] Site news
- [ ] Public Events ?
- [ ] Dead Ghosts ?

## Known issues
- [ ] Safari Display issues for image in Countdown card



## References
1. [Bungie API](https://destiny-db.appspot.com/api/)
2. [Reddit](https://www.reddit.com/r/DestinyDashboard/)
3. [Discord](https://discordapp.com/invite/WJDSUgj)
4. [Bungie User Endpoints](https://www.bungie.net/platform/User/help/)
5. [Bungie Destiny Endpoints](https://www.bungie.net/platform/destiny/help/)
6. [Angular 2+ SSL Info](http://brianflove.com/2016/10/22/angular-cli-using-https/)