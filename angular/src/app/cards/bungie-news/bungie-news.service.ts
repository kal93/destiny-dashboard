import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { BungieSiteNewsService } from 'app/bungie/services/service.barrel';

import { INews } from 'app/bungie/services/interface.barrel';
import { ITwitterReponse } from './bungie-news.interface';
import { NewsTypes } from 'app/bungie/services/enums.interface';

@Injectable()
export class BungieNewsService {

    constructor(private bungieSiteNewsService: BungieSiteNewsService, private http: HttpService) { }

    getBungieTwitter(): Promise<ITwitterReponse> {
        //Cache for 5 min
        return this.http.getWithCache("api/twitter?type=bungie", HttpRequestType.DASHBOARD, 300000);
    }

    getBungieNews(newsType: NewsTypes, page: number, count: number): Promise<INews> {
        return this.bungieSiteNewsService.getBungieNews(newsType, page, count);
    }
}