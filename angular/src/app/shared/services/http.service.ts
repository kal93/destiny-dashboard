import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SharedApp } from './shared-app.service';

import { ErrorTypes } from 'app/bungie/services/errors.interface';

import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs/Subscription';

export interface ICustomCache {
    cachedData: any;
    cachedPromise: Promise<any>;
    cacheExpires: number;
}

export enum HttpRequestType {
    BASIC_JSON,
    BUNGIE_BASIC,
    BUNGIE_PRIVILEGED,
    DASHBOARD
}

@Injectable()
export class HttpService {
    // Set api key info based on if prod or test
    public apiKey: string = environment.apiKey;

    // Application events
    private invalidateCachesSubscription: Subscription;

    // Caches responses based on their URL
    private customCaches = new Map<string, ICustomCache>();

    //Return the same promise if it's been started already
    private tokenPromise: Promise<any>;

    constructor(private http: HttpClient, public sharedApp: SharedApp) {
        // Load Map from local storage
        this.customCaches = this.sharedApp.getLocalStorageMap("httpCustomCaches", new Map<string, ICustomCache>());

        // Listen to if we should invalidate caches
        this.invalidateCachesSubscription = this.sharedApp.invalidateCachesSubject.subscribe(() => {
            this.customCaches = new Map<string, ICustomCache>();
            this.sharedApp.removeLocalStorage("httpCustomCaches");
        });
    }

    ngOnDestroy() {
        this.invalidateCachesSubscription.unsubscribe();
    }

    // Headers
    // private getBungieAuthHeaders(): HttpHeaders {
    //     return new HttpHeaders().set('Authorization', "Basic " + environment.apiEncodedAuth).set('Content-Type', 'application/x-www-form-urlencoded').set('X-API-Key', this.apiKey);
    // }

    private getBungieBasicHeaders(): HttpHeaders {
        return new HttpHeaders().set('X-API-Key', this.apiKey);
    }

    private getBungiePrivilegedHeaders(): HttpHeaders {
        return new HttpHeaders().set('Authorization', "Bearer " + this.sharedApp.accessToken).set('X-API-Key', this.apiKey);
    }

    private getDashboardHeaders(): HttpHeaders {
        if (this.sharedApp.accessToken != null)
            return new HttpHeaders().set('Authorization', this.sharedApp.accessToken);
    }

    //Dashboard specific calls
    public getDashboard(url: string): Promise<any> {
        let loadingId = Date.now();
        this.sharedApp.showLoading(loadingId);

        let headers = this.getDashboardHeaders();

        //Use a prefix url if not serving the API from localhost
        if (environment.useApiPrefix != "")
            url = environment.useApiPrefix + url;

        return this.httpGet(url, headers).then((response) => {
            this.sharedApp.hideLoading(loadingId);
            return response;
        }).catch((error) => {
            this.sharedApp.hideLoading(loadingId);
            this.handleError(error);
        });
    }

    public postDashboard(url: string, body: any): Promise<any> {
        let loadingId = Date.now();
        this.sharedApp.showLoading(loadingId);

        let headers = this.getDashboardHeaders();

        //Use a prefix url if not serving the API from localhost
        if (environment.useApiPrefix != "")
            url = environment.useApiPrefix + url;

        return this.httpPost(url, body, headers).then((response) => {
            this.sharedApp.hideLoading(loadingId);
            return response;
        }).catch((error) => {
            this.sharedApp.hideLoading(loadingId);
            this.handleError(error);
        });
    }

    public deleteDashboard(url: string): Promise<any> {
        let loadingId = Date.now();
        this.sharedApp.showLoading(loadingId);

        let headers = this.getDashboardHeaders();

        //Use a prefix url if not serving the API from localhost
        if (environment.useApiPrefix != "")
            url = environment.useApiPrefix + url;

        return this.httpDelete(url, headers).then((response) => {
            this.sharedApp.hideLoading(loadingId);
            return response;
        }).catch((error) => {
            this.sharedApp.hideLoading(loadingId);
            this.handleError(error);
        });
    }

    // Bungie Specific calls
    public getBungieAccessToken(bungieAuthCode: string): Promise<any> {
        let loadingId = Date.now();
        this.sharedApp.showLoading(loadingId);

        return new Promise((resolve, reject) => {
            this.getBungieTokenResponseFromAPI(bungieAuthCode).then((accessTokenResponse) => {
                this.sharedApp.hideLoading(loadingId);
                resolve(accessTokenResponse);
            }).catch((error) => {
                this.sharedApp.logOutSubject.next();
                this.sharedApp.hideLoading(loadingId);
                reject(error);
            });
        });
    }

    private getBungieTokenResponseFromAPI(authCodeOnce?: string) {
        //If we are authenticating with the one time code, then post it to the server
        // Otherwise, we are refreshing. Post the actual accessToken to the server where it will refresh it automatically

        //Return the promise if it's already started so we don't try to refresh multiple times
        if (this.tokenPromise != null)
            return this.tokenPromise;

        let tokenUrl = authCodeOnce ? "api/bungie/accessToken" : "api/bungie/refreshToken";

        //Use a prefix url if not serving the API from localhost
        if (environment.useApiPrefix != "")
            tokenUrl = environment.useApiPrefix + tokenUrl;

        let postBody = authCodeOnce ? authCodeOnce : this.sharedApp.accessToken;
        this.tokenPromise = this.httpPost(tokenUrl, postBody).then((authResponse) => {
            //Refresh when the token is 98% expired
            this.sharedApp.accessTokenExpires = (Date.now() + authResponse.expiresIn * 1000 * .98);
            this.sharedApp.accessToken = authResponse.accessToken;
            this.sharedApp.membershipId = authResponse.membershipId;

            this.sharedApp.setLocalStorage("accessTokenExpires", this.sharedApp.accessTokenExpires);
            this.sharedApp.setLocalStorage("accessToken", this.sharedApp.accessToken);
            this.sharedApp.setLocalStorage("membershipId", this.sharedApp.membershipId);

            this.tokenPromise = null;

            return authResponse;
        });

        return this.tokenPromise;
    }

    /*
    private getBungieTokenResponseFromClient(authCodeOnce?: string) {
        //If we are authenticating with the one time code, then get authToken from bungie
        // Otherwise, we are refreshing.

        // Return the promise if it's already started so we don't try to refresh multiple times
        if (this.tokenPromise != null)
            return this.tokenPromise;

        let tokenUrl = "https://www.bungie.net/platform/app/oauth/token/";
        if (authCodeOnce) {
            let postBody = "grant_type=authorization_code&code=" + authCodeOnce;
            this.tokenPromise = this.httpPost(tokenUrl, postBody, this.getBungieAuthHeaders());
        }
        else {
            let postBody = "grant_type=refresh_token&refresh_token=" + this.sharedApp.refreshToken;
            this.tokenPromise = this.httpPost(tokenUrl, postBody, this.getBungieAuthHeaders())
        }

        return this.tokenPromise.then((oAuthResponse: any) => {
            //Refresh when the token is 98% expired
            this.sharedApp.accessToken = oAuthResponse.access_token;
            this.sharedApp.accessTokenExpires = (Date.now() + oAuthResponse.expires_in * 1000 * .98);
            this.sharedApp.refreshToken = oAuthResponse.refresh_token;
            this.sharedApp.membershipId = +oAuthResponse.membership_id;

            this.sharedApp.setLocalStorage("accessToken", this.sharedApp.accessToken);
            this.sharedApp.setLocalStorage("accessTokenExpires", this.sharedApp.accessTokenExpires);
            this.sharedApp.setLocalStorage("refreshToken", this.sharedApp.refreshToken);
            this.sharedApp.setLocalStorage("membershipId", this.sharedApp.membershipId);

            this.tokenPromise = null;

            return oAuthResponse;
        });
    }
*/
    private checkBungieRefreshToken(): Promise<any> {
        if (this.sharedApp.accessToken != null && this.sharedApp.accessTokenExpires <= Date.now())
            return this.getBungieTokenResponseFromAPI().catch((error) => {
                console.error("There was an error when trying to Refresh Token.");
            });
        else
            return Promise.resolve();
    }

    private getBungie(url: string, privileged: boolean): Promise<any> {
        let loadingId = Date.now();
        this.sharedApp.showLoading(loadingId);

        return new Promise((resolve, reject) => {
            //If the token needs to be refreshed, do it before making the call
            this.checkBungieRefreshToken().then(() => {
                let headers = privileged ? this.getBungiePrivilegedHeaders() : this.getBungieBasicHeaders();
                this.httpGet(url, headers).then((response) => {
                    this.sharedApp.hideLoading(loadingId);
                    if (response.ErrorCode == 1)
                        resolve(response);
                    else
                        this.handleBungieError(response, reject);
                }).catch((error) => {
                    this.sharedApp.hideLoading(loadingId);
                    this.handleBungieError(error, reject);
                });
            }).catch((error) => {
                this.sharedApp.hideLoading(loadingId);
                reject(error);
            });
        });
    }

    public postBungie(url: string, body: any, privileged: boolean = true): Promise<any> {
        let loadingId = Date.now();
        this.sharedApp.showLoading(loadingId);

        return new Promise((resolve, reject) => {
            //If the token needs to be refreshed, do it before making the call
            this.checkBungieRefreshToken().then(() => {
                let headers = privileged ? this.getBungiePrivilegedHeaders() : this.getBungieBasicHeaders();
                this.httpPost(url, body, headers).then((response) => {
                    this.sharedApp.hideLoading(loadingId);
                    if (response.ErrorCode == 1)
                        resolve(response);
                    else
                        this.handleBungieError(response, reject);
                }).catch((error) => {
                    this.sharedApp.hideLoading(loadingId);
                    this.handleBungieError(error, reject);
                });
            }).catch((error) => {
                this.sharedApp.hideLoading(loadingId);
                reject(error);
            });
        });
    }

    private handleBungieError(error: any, reject: any) {
        //Bungie specific error we can handle probably
        if (error.ErrorCode) {
            switch (error.ErrorCode) {
                case ErrorTypes.UnhandledException:
                case ErrorTypes.DestinyUnexpectedError:
                case ErrorTypes.DestinyShardRelayProxyTimeout:
                    this.sharedApp.showError("An error occurred while trying to get data from Bungie, please try again later.", error);
                    break;

                case ErrorTypes.DestinyAccountNotFound:
                    //this.sharedApp.showError("Could not find Destiny information for this Bungie account. Have you played with this account?");
                    break;

                default:
                // Let error bubble back up
            }
            return reject(error);
        }

        //Actual HTTP error 
        else if (error.status != null) {
            //Give more detail for errors we have some info about
            switch (error.status) {
                case 401:
                    this.sharedApp.showError("Authentication error when trying to connect to Bungie. Please try to log in again.", error);
                    this.sharedApp.logOutSubject.next();
                    return reject(error);

                default:
                    console.error(error);
                    break;
            }

            return reject(error);
        }
    }

    public getWithCache(requestUrl: string, requestType: HttpRequestType, cacheTimeMs: number, headers?: HttpHeaders): Promise<any> {
        //Fetch cache based on unique URL
        let customCache = this.customCaches.get(requestUrl);

        //Clear cache if it's stale or hasn't been set yet
        if (!customCache || (customCache.cacheExpires && customCache.cacheExpires < Date.now()) || environment.disableHttpCache) {
            this.customCaches.delete(requestUrl);

            customCache = {
                cachedData: null,
                cachedPromise: null,
                cacheExpires: null
            }
        }
        //Data is available, return it as a resolved promise
        if (customCache.cachedData)
            return Promise.resolve(customCache.cachedData);

        //Promise is in progress, return it so callee can subscribe to it
        else if (customCache.cachedPromise)
            return customCache.cachedPromise;

        else {
            //Set the promise for this cache entry
            if (requestType == HttpRequestType.BASIC_JSON) {
                customCache.cachedPromise = this.httpGet(requestUrl, headers)
                    .then(response => {
                        //Cache response, in the specific format returned by the HttpResponseType
                        customCache.cachedData = response;

                        //Mark when cache expires
                        customCache.cacheExpires = Date.now() + cacheTimeMs;

                        //Don't need the promise any more
                        customCache.cachedPromise = null;

                        //Before we save cache object to localStorage, make sure we're only saving valid caches
                        this.saveCacheToLocalStorage();

                        //Return the data so it can be consumed by callee
                        return customCache.cachedData;
                    });
            }
            else if (requestType == HttpRequestType.BUNGIE_BASIC || requestType == HttpRequestType.BUNGIE_PRIVILEGED) {
                let isPrivileged = requestType == HttpRequestType.BUNGIE_PRIVILEGED;
                if (isPrivileged && this.sharedApp.accessToken == null) {
                    console.error("No auth token provided when calling privileged endpoint.");
                    return Promise.reject("No auth token provided when calling privileged endpoint.");
                }
                customCache.cachedPromise = this.getBungie(requestUrl, isPrivileged)
                    .then(response => {
                        customCache.cachedData = response.Response; //Response is already JSON format from getBungie call
                        customCache.cacheExpires = Date.now() + cacheTimeMs;
                        customCache.cachedPromise = null;
                        this.saveCacheToLocalStorage();
                        return customCache.cachedData;
                    });
            }
            else if (requestType == HttpRequestType.DASHBOARD) {
                customCache.cachedPromise = this.getDashboard(requestUrl)
                    .then(response => {
                        customCache.cachedData = response; //Response is already JSON format from getDashboard() call
                        customCache.cacheExpires = Date.now() + cacheTimeMs;
                        customCache.cachedPromise = null;
                        this.saveCacheToLocalStorage();
                        return customCache.cachedData;
                    });
            }

            // Reset cached promise if it errors
            customCache.cachedPromise.catch((error) => {
                customCache.cachedPromise = null;
            });

            //Store it in the promise cache
            this.customCaches.set(requestUrl, customCache);

            return customCache.cachedPromise;
        }
    }

    //Delete a specific cache entry
    public invalidateCache(requestUrl: string) {
        this.customCaches.delete(requestUrl);
        this.saveCacheToLocalStorage();
    }

    private saveCacheToLocalStorage() {
        //Before we save cache object to localStorage, make sure we're only saving valid caches
        this.customCaches.forEach((cache, id) => {
            if (cache.cacheExpires < Date.now())
                this.customCaches.delete(id);
        });

        let cacheString = JSON.stringify(Array.from(this.customCaches));

        //Make sure cache doesn't grow too big (Shouldn't happen, but just be safe)     
        //JavaScript strings are stored as UTF-16, so double the size and verify we're under the target MB   
        if (cacheString.length * 2 > (1048576 * 2)) {
            this.sharedApp.showInfo("Cache grew too big, cleaning now. It's ok.")
            this.sharedApp.removeLocalStorage("httpCustomCaches");
        }
        //Save cache to localStorage    
        else
            this.sharedApp.setLocalStorage("httpCustomCaches", cacheString);
    }


    // Basic HTTP
    public httpGet(url: string, headers?: HttpHeaders): Promise<any> {
        let loadingId = Date.now();
        this.sharedApp.showLoading(loadingId);
        return this.http.get(url, { headers }).toPromise().then((response) => {
            this.sharedApp.hideLoading(loadingId);
            return response;
        }).catch((error) => {
            this.sharedApp.hideLoading(loadingId);
            this.handleError(error);
        });
    }

    public httpGetBinary(url: string): Promise<any> {
        let loadingId = Date.now();
        this.sharedApp.showLoading(loadingId);
        return this.http.get(url, { responseType: 'blob' }).toPromise().then((response) => {
            this.sharedApp.hideLoading(loadingId);
            return response;
        }).catch((error) => {
            this.sharedApp.hideLoading(loadingId);
            this.handleError(error);
        });
    }

    public httpPost(url: string, body: any, headers?: HttpHeaders): Promise<any> {
        let loadingId = Date.now();
        this.sharedApp.showLoading(loadingId);
        return this.http.post(url, body, { headers }).toPromise().then((response) => {
            this.sharedApp.hideLoading(loadingId);
            return response;
        }).catch((error) => {
            this.sharedApp.hideLoading(loadingId);
            this.handleError(error);
        });
    }

    public httpDelete(url: string, headers?: HttpHeaders): Promise<any> {
        let loadingId = Date.now();
        this.sharedApp.showLoading(loadingId);
        return this.http.delete(url, { headers }).toPromise().then((response) => {
            this.sharedApp.hideLoading(loadingId);
            return response;
        }).catch((error) => {
            this.sharedApp.hideLoading(loadingId);
            this.handleError(error);
        });
    }

    handleError(error) {
        console.error(error);
        throw error;
    }
}