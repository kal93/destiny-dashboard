import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { TimeSpan } from 'app/bungie/services/enums.interface';


@Injectable()
export class TwitchService {
    private twitchClientId: string = "l4w6ogugmp0qgeh2gz9uqa1z0bg0rj";

    constructor(protected http: HttpService) {
    }

    getTopStreams(): Promise<any> {
        let headers = new HttpHeaders().set('client-id', this.twitchClientId);

        return this.http.getWithCache("https://api.twitch.tv/kraken/streams?limit=8&offset=0&game=Destiny%202", HttpRequestType.BASIC_JSON, TimeSpan.MINUTES_10, headers);
    }
}