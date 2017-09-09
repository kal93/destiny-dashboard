import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';

import { DestinyMembership, INews } from 'app/bungie/services/interface.barrel'
import { NewsTypes, TimeSpan } from 'app/bungie/services/enums.interface';

/** This Injectable manages the data layer for Destiny Accounts.*/
@Injectable()
export class BungieSiteNewsService {
    constructor(private http: HttpService, private sharedApp: SharedApp) { }

    getBungieNews(newsType: NewsTypes, page: number, count: number): Promise<INews> {
        let requestUrl = "https://www.bungie.net/Platform/Content/Site/News/" + newsType + "/" + this.sharedApp.languageKey + "/?currentpage=" + page + "&itemsperpage=" + count;

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, TimeSpan.MINUTES_5);
    }
}