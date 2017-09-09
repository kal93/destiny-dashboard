import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { TimeSpan } from 'app/bungie/services/enums.interface';

@Injectable()
export class RedditService {
    constructor(protected http: HttpService) { }

    getHotPosts(afterQueryParm?: string): Promise<any> {
        let requestUrl = "https://www.reddit.com/r/destinythegame/hot.json?limit=8";
        if (afterQueryParm != null) requestUrl += afterQueryParm;
        return this.http.getWithCache(requestUrl, HttpRequestType.BASIC_JSON, TimeSpan.MINUTES_2);
    }

    getNewPosts(afterQueryParm?: string): Promise<any> {
        let requestUrl = "https://www.reddit.com/r/destinythegame/new.json?limit=8";
        if (afterQueryParm != null) requestUrl += afterQueryParm;
        return this.http.getWithCache(requestUrl, HttpRequestType.BASIC_JSON, TimeSpan.MINUTES_2);
    }
}