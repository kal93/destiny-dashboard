import {Injectable} from '@angular/core';
import {HttpRequestType, HttpService} from 'app/shared/services/http.service';
import {SharedApp} from 'app/shared/services/shared-app.service';
import {SharedBungie} from '../../shared-bungie.service';
import {DestinyMembership} from '../user/user.interface';

@Injectable()
export class AccountGrimoireService {
    private cacheTimeMs: number = 30000;

    constructor(private http: HttpService, private sharedApp: SharedApp, private sharedBungie: SharedBungie) {
    }

    getAccountGrimoire(membership: DestinyMembership) {
        const requestUrl = 'https://www.bungie.net/d1/Platform/Destiny/Vanguard/Grimoire' + membership.membershipType + '/' + membership.membershipId;

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, this.cacheTimeMs).then(response => response.data);
    }
}