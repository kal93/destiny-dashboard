import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from '../shared/services/http.service';
import { DestinyProfileService } from 'app/bungie/services/service.barrel';

import { environment } from '../../environments/environment';
import { BungieNetUser, DestinyMembership, DestinyMembershipType } from './services/user/user.interface';

/** This Injectable manages the data layer for a Bungie User */
@Injectable()
export class SharedBungie {
    //Bungie user data
    public bungieNetUser: BungieNetUser;
    public destinyMemberships: DestinyMembership[];

    constructor(private destinyProfileService: DestinyProfileService, public http: HttpService) { }

    getMembershipsForCurrentUser(): Promise<Array<DestinyMembership>> {
        //Get bungie account information, cache for 5 minutes
        return new Promise((resolve, reject) => {
            this.http.getWithCache("https://www.bungie.net/Platform/User/GetMembershipsForCurrentUser/", HttpRequestType.BUNGIE_PRIVILEGED, 180000).then(response => {
                this.bungieNetUser = response.bungieNetUser;
                this.destinyMemberships = response.destinyMemberships;
                // Filter out old destiny memberships (Destiny 1)

                let basicProfilePromises = new Array<Promise<any>>();
                this.destinyMemberships.forEach((membership) => {
                    let profilePromise = this.destinyProfileService.getBasicProfile(membership).then((response) => {
                    }).catch((error) => {
                        // Remove membership
                        this.destinyMemberships.splice(this.destinyMemberships.indexOf(membership), 1);
                    });
                    basicProfilePromises.push(profilePromise);
                });

                Promise.all(basicProfilePromises).then(() => {
                    resolve(this.destinyMemberships)
                });
            }).catch((error) => {
                reject(reject);
            });;
        });
    }

    searchDestinyPlayer(membershipType: DestinyMembershipType, gamertag: string): Promise<any> {
        //Get bungie account information, cache for 1 minute 
        return this.http.getWithCache("https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/" + membershipType + "/" + encodeURIComponent(gamertag) + "/ ",
            HttpRequestType.BUNGIE_BASIC, 1 * 60 * 1000).then(response => {
                if (response.length > 0)
                    return response[0];
                return null;
            });
    }

    deleteAccessToken() {
        return this.http.deleteDashboard("api/bungie/accessToken/");
    }
}