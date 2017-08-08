import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpRequestType, HttpService } from '../../shared/services/http.service';
import { BungieSiteNewsService } from '../../bungie/services/service.barrel';

import { INews } from '../../bungie/services/interface.barrel';
import { ITwitterReponse } from './bungie-news.interface';
import { NewsTypes } from '../../bungie/services/enums.interface';

@Injectable()
export class BungieNewsService {
    private clientId: string = "l4w6ogugmp0qgeh2gz9uqa1z0bg0rj";

    constructor(private bungieSiteNewsService: BungieSiteNewsService, private http: HttpService) {
    }

    getBungieTwitter(): Promise<ITwitterReponse> {
        //Cache for 5 min
        return this.http.getWithCache("api/twitter?type=bungie", HttpRequestType.BASIC_JSON, 300000);
    }

    getBungieNews(newsType: NewsTypes, page: number, count: number): Promise<INews> {
        return this.bungieSiteNewsService.getBungieNews(newsType, page, count);
    }
}