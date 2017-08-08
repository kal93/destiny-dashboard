import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SharedApp } from './shared-app.service';

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
export class HttpService implements OnDestroy {
    // Set api key info based on if prod or test
    public apiKey: string = environment.apiKey;

    // Application events
    private invalidateCachesSubscription: Subscription;

    // Caches responses based on their URL
    private customCaches = new Map<string, ICustomCache>();

    //Return the same promise if it's been started already
    private refreshTokenPromise: Promise<any>;

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
    private getBungieBasicAuthHeaders(): HttpHeaders {
        return new HttpHeaders().set('X-API-Key', this.apiKey);
    }

    private getBungiePrivilegedAuthHeaders(): HttpHeaders {
        return new HttpHeaders().set('Authorization', "Bearer " + this.sharedApp.accessToken).set('X-API-Key', this.apiKey);
    }

    private getDashboardHeaders(): HttpHeaders {
        if (this.sharedApp.accessToken == null)
            throw "sharedApp.accessToken was null when calling getDashboardHeaders()";

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
            this.getBungieTokenResponse(bungieAuthCode).then((accessTokenResponse) => {
                this.sharedApp.hideLoading(loadingId);
                resolve(accessTokenResponse);
            }).catch((error) => {
                this.sharedApp.hideLoading(loadingId);
                reject(error);
            });
        });
    }

    private getBungieTokenResponse(authCodeOnce?: string) {
        //If we are authenticating with the one time code, then post it to the server
        // Otherwise, we are refreshing. Post the actual accessToken to the server where it will refresh it automatically

        //Return the promise if it's already started so we don't try to refresh multiple times
        if (this.refreshTokenPromise != null)
            return this.refreshTokenPromise;

        let tokenUrl = authCodeOnce ? "api/bungie/accessToken" : "api/bungie/refreshToken";

        //Use a prefix url if not serving the API from localhost
        if (environment.useApiPrefix != "")
            tokenUrl = environment.useApiPrefix + tokenUrl;

        let postBody = authCodeOnce ? authCodeOnce : this.sharedApp.accessToken;
        this.refreshTokenPromise = this.httpPost(tokenUrl, postBody).then((authResponse) => {
            //Refresh when the token is 98% expired
            this.sharedApp.accessTokenExpires = (Date.now() + authResponse.expiresIn * 1000 * .98);
            this.sharedApp.accessToken = authResponse.accessToken;
            this.sharedApp.membershipId = authResponse.membershipId;

            this.sharedApp.setLocalStorage("accessTokenExpires", this.sharedApp.accessTokenExpires);
            this.sharedApp.setLocalStorage("accessToken", this.sharedApp.accessToken);
            this.sharedApp.setLocalStorage("membershipId", this.sharedApp.membershipId);

            this.refreshTokenPromise = null;

            return authResponse;
        });

        return this.refreshTokenPromise
    }

    private checkBungieRefreshToken(): Promise<any> {
        if (this.sharedApp.accessToken != null && this.sharedApp.accessTokenExpires <= Date.now())
            return this.getBungieTokenResponse().catch((error) => {
                console.log("There was an error when trying to Refresh Token.");
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
                var headers = privileged ? this.getBungiePrivilegedAuthHeaders() : this.getBungieBasicAuthHeaders();
                this.httpGet(url, headers).then((response) => {
                    this.sharedApp.hideLoading(loadingId);
                    if (response.ErrorCode != 1)
                        throw (response);
                    else
                        resolve(response);
                }).catch((error) => {
                    this.sharedApp.hideLoading(loadingId);

                    //Bungie specific error we can handle probably
                    if (error.ErrorCode) {
                        switch (error.ErrorCode) {
                            case 1601:
                                this.sharedApp.showError("Could not find Destiny information for this Bungie account. Have you played with this account?");
                                break;
                        }
                    }

                    //Actual HTTP error 
                    else if (error.status)
                        //Give more detail for errors we have some info about
                        switch (error.status) {
                            case 401:
                                this.sharedApp.showError("Authentication error when trying to connect to Bungie. Please try to log in again.", error);
                                reject(error);
                                break;

                            default:
                                console.log(error);
                                reject(error);
                                break;
                        }
                });
            }).catch((error) => {
                this.sharedApp.hideLoading(loadingId);
                reject(error);
            });
        });
    }

    public getWithCache(requestUrl: string, requestType: HttpRequestType, cacheTimeMs: number): Promise<any> {
        //Fetch cache based on unique URL
        var customCache = this.customCaches.get(requestUrl);

        //Clear cache if it's stale or hasn't been set yet
        if (!customCache || (customCache.cacheExpires && customCache.cacheExpires < Date.now())) {
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
                customCache.cachedPromise = this.httpGet(requestUrl)
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

        var cacheString = JSON.stringify(Array.from(this.customCaches));

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
        var loadingId = Date.now();
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
        var loadingId = Date.now();
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
        var loadingId = Date.now();
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
        var loadingId = Date.now();
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
        console.log(error);
        throw error;
    }
}