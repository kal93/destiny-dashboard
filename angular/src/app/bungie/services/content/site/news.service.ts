import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from '../../../../shared/services/http.service';
import { SharedApp } from '../../../../shared/services/shared-app.service';
import { SharedBungie } from '../../../shared-bungie.service';

import { DestinyMembership } from '../../../../bungie/services/user/user.interface'
import { INews } from './news.interface';

/** This Injectable manages the data layer for Destiny Accounts.*/
@Injectable()
export class BungieNewsService {
    private cacheTimeMs: number = 30000;

    constructor(private http: HttpService, private sharedApp: SharedApp, private sharedBungie: SharedBungie) { }

    getBungieNews(page: number): Promise<INews> {
        var requestUrl = "https://www.bungie.net/Platform/Content/Site/News/all/" + this.sharedApp.languageKey + "/?currentpage=" + page + "&itemsperpage=10";

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, this.cacheTimeMs);
    }
}