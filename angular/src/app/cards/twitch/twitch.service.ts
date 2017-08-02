import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpService } from '../../shared/services/http.service';

@Injectable()
export class TwitchService {
    private clientId: string = "l4w6ogugmp0qgeh2gz9uqa1z0bg0rj";

    constructor(protected http: HttpService) {
    }

    getTopStreams(): Promise<any> {
        let headers = new HttpHeaders().set('client-id', this.clientId);

        return this.http.httpGet("https://api.twitch.tv/kraken/streams?limit=60&offset=0&game=Destiny%202", headers);
    }
}