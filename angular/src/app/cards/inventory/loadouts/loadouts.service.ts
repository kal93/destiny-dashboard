import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { ILoadout } from './loadouts.interface'

@Injectable()
export class LoadoutsService {
    constructor(protected http: HttpService) { }

    private tempLoadouts: Array<ILoadout> = [{
        name: "Loadout 1",
        itemHashes: [1, 2, 3]
    }];

    getUserLoadouts(membershipId: string): Promise<Array<ILoadout>> {
        // return this.http.getWithCache("api/dashboard/userLoadouts", HttpRequestType.DASHBOARD, 120000);
        this.tempLoadouts = JSON.parse(localStorage.getItem("loadouts"));
        if (!this.tempLoadouts)
            this.tempLoadouts = [];
        return Promise.resolve(this.tempLoadouts);
    }

    saveUserLoadouts(userLoadouts: Array<ILoadout>) {
        localStorage.setItem("loadouts", JSON.stringify(userLoadouts));
    }
}