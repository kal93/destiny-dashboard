
import { ModuleWithProviders } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, Routes, RouterModule, RouteReuseStrategy } from '@angular/router';

import { DashboardComponent } from '../dashboard/dashboard.component';
import { AboutComponent } from '../about/about.component';

import { BungieNewsComponent } from '../cards/bungie-news/bungie-news.component';
import { CountdownComponent } from '../cards/countdown/countdown.component';
import { ItemManagerComponent } from '../cards/item-manager/item-manager.component';
import { PublicEventsComponent } from '../cards/public-events/public-events.component';
import { DownloadManifestComponent } from '../bungie/manifest/download/download.component';
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
            animation: 'dashboard',
            title: "Dashboard"
        }
    },
    {
        path: 'about', component: AboutComponent, data: {
            animation: 'card',
            title: "About"
        }
    },
    {
        path: 'bungie-news', component: BungieNewsComponent, data: {
            animation: 'card',
            title: "Bungie News"
        }
    },
    {
        path: 'countdown', component: CountdownComponent, data: {
            animation: 'card',
            title: "Countdown"
        }
    },
    {
        path: 'download-manifest', component: DownloadManifestComponent, data: {
            animation: 'card',
            title: "Download Manifest"
        }
    },
    {
        canActivate: [AuthGuard],
        path: 'item-manager', component: ItemManagerComponent, data: {
            animation: 'card',
            title: "Item Manager"
        }
    },
    {
        path: 'public-events', component: PublicEventsComponent, data: {
            animation: 'card',
            title: "Public Events"
        }
    },
    {
        path: 'stats', component: StatsComponent, data: {
            animation: 'card',
            title: "Stats"
        }
    }
];

export const Routing: ModuleWithProviders = RouterModule.forRoot(routes, { useHash: true });