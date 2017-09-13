import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { ManifestService } from 'app/bungie/manifest/manifest.service';

import { ModeTypes, TimeSpan } from 'app/bungie/services/enums.interface';
import { PublicMilestoneBase } from 'app/bungie/services/interface.barrel';

@Injectable()
export class DestinyMilestonesService {
    constructor(protected http: HttpService, private manifestService: ManifestService, private sharedApp: SharedApp) { }

    getPublicMilestones(): Promise<{ [key: number]: PublicMilestoneBase }> {
        let requestUrl = "https://www.bungie.net/Platform/Destiny2/Milestones/";

        //Get the response, or return the cached result
        return this.http.getWithCache(requestUrl, HttpRequestType.BUNGIE_BASIC, TimeSpan.MINUTES_30);
    }
} 