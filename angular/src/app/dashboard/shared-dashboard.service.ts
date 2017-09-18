import { Injectable } from '@angular/core';
import { HttpRequestType, HttpService } from '../shared/services/http.service';
import { SharedApp } from '../shared/services//shared-app.service';

import { environment } from '../../environments/environment';
import { CardDefinitions } from '../cards/_base/card-definition';
import { ICard, IUserDashboard } from '../cards/_base/card.interface';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

/** This Injectable manages the data layer for a Bungie User and the Dashbaord User */
@Injectable()
export class SharedDashboard {
    // Shared dashboard vairables
    public editMode: boolean = false;
    public isDefaultDashboardSelected: boolean = true;

    userDashboards = new Array<IUserDashboard>();
    selectedDashboard: IUserDashboard;

    constructor(public http: HttpService, protected sharedApp: SharedApp) { }

    setDashboards(userDashboards: Array<IUserDashboard>) {
        if (this.sharedApp.accessToken == null) {
            this.userDashboards = new Array<IUserDashboard>();
            this.selectedDashboard = CardDefinitions.defaultDashboards[0];
        }
        else {
            this.userDashboards = userDashboards;
        }
    }

    setSelectedDashboard(dashboard: IUserDashboard) {
        if (this.sharedApp.accessToken == null || dashboard == null) {
            let defaultDeashboardIndex = dashboard.id * -1 - 1;
            this.selectedDashboard = CardDefinitions.defaultDashboards[defaultDeashboardIndex];
            this.isDefaultDashboardSelected = true;
        }
        else {
            this.selectedDashboard = dashboard;
            let lastDashboardIndex = this.userDashboards.indexOf(dashboard);

            // Only save the dashboard index if it exists in the users dashboards. Otherwise it's a default dash
            if (lastDashboardIndex >= 0) {
                this.sharedApp.setLocalStorage("lastDashboardIndex", lastDashboardIndex);
                this.isDefaultDashboardSelected = false;
            }
            else {
                this.isDefaultDashboardSelected = true;
            }
        }
    }

    clearUserDashboards() {
        this.userDashboards = new Array<IUserDashboard>();
        this.selectedDashboard = CardDefinitions.defaultDashboards[0];
    }

    loadUser(): Promise<any> {
        return Promise.all([this.getUserDashboards(), this.getUserPreferences()]).then((responses: Array<any>) => {
            let dashboardsResponse: Array<IUserDashboard> = responses[0];
            //User had no cards saved in the database
            if (dashboardsResponse.length == 0) {
                this.sharedApp.showInfoOncePerSession("We created you your first dashboard. Add or remove cards to customize your dashboard.");

                // If user has absolutely no cards, give them a clone of the first default one and save
                if (this.userDashboards.length == 0) {
                    let firstDefaultDashboard: IUserDashboard = this.sharedApp.deepCopyObject(CardDefinitions.defaultDashboards[0]);
                    firstDefaultDashboard.name = "My Dashboard";
                    this.setDashboards([firstDefaultDashboard]);
                    this.setSelectedDashboard(firstDefaultDashboard);
                    this.saveUserDashboard(firstDefaultDashboard);
                }
            }
            else {
                this.setDashboards(CardDefinitions.initDashboardsFromAPI(dashboardsResponse));
                let lastDashboardIndex = this.sharedApp.getLocalStorage("lastDashboardIndex", 0);
                if (lastDashboardIndex >= this.userDashboards.length) lastDashboardIndex = 0;
                this.selectedDashboard = this.userDashboards[lastDashboardIndex];
            }
            this.isDefaultDashboardSelected = false;

            this.sharedApp.userPreferences = responses[1];
        }).catch((error) => {
            this.sharedApp.showError("There was an error when trying to load your user. Please try to log in again.", error);
            this.sharedApp.logOutSubject.next();
            throw (error);
        });
    }

    reloadLayout() {
        //Create a new object with a new reference so the dashboard reloads
        this.setDashboards(this.sharedApp.deepCopyObject(this.userDashboards));

        //If we're reloading the layout, clear caches too
        this.sharedApp.invalidateCachesSubject.next();
    }

    getUserDashboards(): Promise<any> {
        return this.http.getWithCache("api/dashboard/dashboard", HttpRequestType.DASHBOARD, 60000);
    }

    saveUserDashboard(dashboardToSave: IUserDashboard): Promise<any> {
        if (this.sharedApp.accessToken == null)
            Promise.reject("sharedApp.accessToken was null when calling saveUserDashboard()");

        //Create temporary object so we can delete properties we don't need to send server side
        let dashboardToSaveReplica: IUserDashboard = this.sharedApp.deepCopyObject(dashboardToSave);
        dashboardToSaveReplica.cards.forEach((card) => {
            delete card.id;
            delete card.layout;
            delete card.definition;
        });

        //When we save, invalidate the cache
        this.http.invalidateCache("api/dashboard/dashboard");

        return this.http.postDashboard("api/dashboard/dashboard", dashboardToSaveReplica).then((newId) => {
            //Get the new id that was just saved to the database
            dashboardToSave.id = newId;
        }).catch((error) => {
            this.sharedApp.showError("There was an error when trying to save the dashboard. Please try again.", error);
            throw (error);
        });
    }

    deleteUserDashboard(dashboardToDelete: IUserDashboard) {
        // User created a new dashboard without deleting the original one, now they are deleting the original one.
        // It's not in the database so don't send delete request
        if (dashboardToDelete.id == -1)
            return;

        //User is trying to delete their last dashboard
        if (this.userDashboards.length < 2) {
            console.error("Attempted to delete last dashboard. This shouldn't happen.");
            return;
        }

        // If we're deleting the selected dashboard, set the selected dashboard to a different on
        let deletingSelected: boolean = this.selectedDashboard == dashboardToDelete;

        // Remove target dashboard
        this.userDashboards.splice(this.userDashboards.indexOf(dashboardToDelete), 1);

        // Update the selected dashboard since we just deleted it
        if (deletingSelected)
            this.selectedDashboard = this.userDashboards[0];

        //When we save, invalidate the cache
        this.http.invalidateCache("api/dashboard/dashboard");

        return this.http.deleteDashboard("api/dashboard/dashboard/?id=" + dashboardToDelete.id).catch((error) => {
            this.sharedApp.showError("There was an error when trying to delete your dashboard. Please try again.", error);
        });
    }

    //Dashboard network calls
    getUserPreferences(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let userPreferences = this.sharedApp.getLocalStorageAsJsonObject("userPreferences", { membershipIndex: 0 });
            resolve(userPreferences);
        });

        //return this.http.getWithCache("api/dashboard/userPreferences", HttpRequestType.DASHBOARD, 120000);
    }

    saveUserPreferences() {
        //When we save, invalidate the cache
        //this.http.invalidateCache("api/dashboard/userPreferences");
        //return this.http.postDashboard("api/dashboard/userPreferences", this.sharedApp.userPreferences);
        return new Promise<any>((resolve, reject) => {
            this.sharedApp.setLocalStorage("userPreferences", JSON.stringify(this.sharedApp.userPreferences));
            resolve();
        });
    }

    generateDashboardName() {
        let newDashboardName: string;
        let i = 1;
        while (true) {
            let nameExists: boolean = false;
            newDashboardName = "Dashboard " + i;
            for (let j = 0; j < this.userDashboards.length; j++) {
                if (this.userDashboards[j].name.toLowerCase() == newDashboardName.toLowerCase()) {
                    nameExists = true;
                    break;
                }
            }
            if (!nameExists) break;
            i++;
        }

        return newDashboardName;
    }
}