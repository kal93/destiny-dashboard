
import { ModuleWithProviders } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, Routes, RouterModule, RouteReuseStrategy } from '@angular/router';

import { DashboardComponent } from '../dashboard/dashboard.component';
import { AboutComponent } from '../about/about.component';
import { DownloadManifestComponent } from '../bungie/manifest/download-manifest.component';
import { SettingsComponent } from '../settings/settings.component';

import { BungieNewsComponent } from '../cards/bungie-news/bungie-news.component';
import { ClanLeaderboardsComponent } from '../cards/clan-leaderboards/clan-leaderboards.component';
import { CountdownComponent } from '../cards/countdown/countdown.component';
import { DashboardNewsComponent } from '../cards/dashboard-news/dashboard-news.component';
import { DatabaseComponent } from '../cards/database/database.component';
import { ItemManagerComponent } from '../cards/inventory/inventory.component';
import { ReputationComponent } from '../cards/reputation/reputation.component';
import { RedditComponent } from '../cards/reddit/reddit.component';
import { StatsComponent } from '../cards/stats/stats.component';
import { TwitchComponent } from '../cards/twitch/twitch.component';

import { AuthGuard } from './guards/auth.guard';

export class CustomReuseStrategy implements RouteReuseStrategy {
    routesToCache: string[] = ["dashboard"];
    storedRouteHandles = new Map<string, DetachedRouteHandle>();

    // Decides if the route should be stored
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return this.routesToCache.indexOf(route.routeConfig.path) > -1;
    }

    //Store the information for the route we're destructing
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        this.storedRouteHandles.set(route.routeConfig.path, handle);
    }

    //Return true if we have a stored route object for the next route
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return this.storedRouteHandles.has(route.routeConfig.path);
    }

    //If we returned true in shouldAttach(), now return the actual route data for restoration
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        return this.storedRouteHandles.get(route.routeConfig.path);
    }

    //Reuse the route if we're going to and from the same route
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return future.routeConfig === curr.routeConfig;
    }
}

const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    {
        path: 'dashboard', component: DashboardComponent, data: {
            title: "Dashboard"
        }
    },
    {
        path: 'about', component: AboutComponent, data: {
            title: "About"
        }
    },
    {
        path: 'settings', component: SettingsComponent, data: {
            title: "Settings"
        }
    },
    {
        path: 'bungie-news', component: BungieNewsComponent, data: {
            title: "Bungie News"
        }
    },
    {
        path: 'clan-leaderboards', component: ClanLeaderboardsComponent, data: {
            title: "Clan Leaderboards"
        }
    },
    {
        path: 'countdown', component: CountdownComponent, data: {
            title: "Countdown"
        }
    },
    {
        path: 'dashboard-news', component: DashboardNewsComponent, data: {
            title: "Dashboard News"
        }
    },
    {
        path: 'database', component: DatabaseComponent, data: {
            title: "Database"
        }
    },
    {
        path: 'download-manifest', component: DownloadManifestComponent, data: {
            title: "Download Manifest"
        }
    },
    {
        canActivate: [AuthGuard],
        path: 'inventory', component: ItemManagerComponent, data: {
            title: "Inventory"
        }
    },
    {
        path: 'reputation', component: ReputationComponent, data: {
            title: "Reputation"
        }
    },
    {
        path: 'stats', component: StatsComponent, data: {
            title: "Stats"
        }
    }
];

export const Routing: ModuleWithProviders = RouterModule.forRoot(routes, { useHash: true });