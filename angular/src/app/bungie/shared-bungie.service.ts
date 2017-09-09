import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from '../shared/services/http.service';
import { DestinyProfileService } from 'app/bungie/services/service.barrel';
import { SharedApp } from 'app/shared/services/shared-app.service';

import { environment } from '../../environments/environment';
import { BungieNetUser, DestinyMembership, DestinyMembershipType } from './services/user/user.interface';

/** This Injectable manages the data layer for a Bungie User */
@Injectable()
export class SharedBungie {
    //Bungie user data
    public bungieNetUser: BungieNetUser;
    public destinyMemberships: DestinyMembership[];

    constructor(private destinyProfileService: DestinyProfileService, public http: HttpService, private sharedApp: SharedApp) {
    }

    getMembershipsForCurrentUser(): Promise<Array<DestinyMembership>> {
        //Get bungie account information, cache for 5 minutes
        return new Promise((resolve, reject) => {
            this.http.getWithCache("https://www.bungie.net/Platform/User/GetMembershipsForCurrentUser/", HttpRequestType.BUNGIE_PRIVILEGED, 180000).then(response => {
                this.bungieNetUser = response.bungieNetUser;
                this.destinyMemberships = response.destinyMemberships;

                // Filter out destiny 1 memberships
                let basicProfilePromises = new Array<Promise<any>>();
                this.destinyMemberships.forEach((membership) => {
                    let membershipLocalStorageId: string = "d2membershipId-" + membership.membershipId;
                    var membershipIdEntry = this.sharedApp.getLocalStorage(membershipLocalStorageId);

                    // Don't fetch membershipids that we already know are d2. We have to still test d1 accounts since they could upgrade to d2
                    if (membershipIdEntry == null || membershipIdEntry == "false") {
                        let profilePromise = this.destinyProfileService.getBasicProfile(membership).then((response) => {
                            this.sharedApp.setLocalStorage(membershipLocalStorageId, true);
                        }).catch((error) => {
                            this.sharedApp.setLocalStorage(membershipLocalStorageId, false);
                            // If it's not a destiny 2 membership, remove it
                            this.destinyMemberships.splice(this.destinyMemberships.indexOf(membership), 1);
                        });
                        basicProfilePromises.push(profilePromise);
                    }
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