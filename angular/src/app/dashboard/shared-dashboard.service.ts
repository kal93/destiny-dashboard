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

    //Notify other parts of the application when we have changed dashboards
    public userDashboardsChangedSubject = new Subject<void>();

    private _userDashboards = new Array<IUserDashboard>();
    get userDashboards(): Array<IUserDashboard> {
        return this._userDashboards;
    }
    set userDashboards(userDashboards: Array<IUserDashboard>) {
        this._userDashboards = userDashboards;

        let lastDashboardIndex = this.sharedApp.getLocalStorage("selectedDashboardId", 0);
        if (lastDashboardIndex >= this.userDashboards.length) lastDashboardIndex = 0;
        this._selectedDashboard = this.userDashboards[lastDashboardIndex];

        this.userDashboardsChangedSubject.next();
    }

    private _selectedDashboard: IUserDashboard;
    get selectedDashboard(): IUserDashboard {
        return this._selectedDashboard;
    }
    set selectedDashboard(selectedDashboard: IUserDashboard) {
        this._selectedDashboard = selectedDashboard;
        this.sharedApp.setLocalStorage("selectedDashboardId", this.userDashboards.indexOf(selectedDashboard));
    }

    constructor(public http: HttpService, protected sharedApp: SharedApp) { }

    loadUser(): Promise<any> {
        return Promise.all([this.getUserDashboards(), this.getUserPreferences()]).then((responses: Array<any>) => {
            let layoutResponse: Array<IUserDashboard> = responses[0];
            //User had no cards saved in the database
            if (layoutResponse.length == 0) {
                this.sharedApp.showInfoOnce("Add or remove cards to customize your dashboard.");

                // If user has absolutely no cards, give them the default ones and save them
                if (this.userDashboards.length == 0) {
                    this.userDashboards = CardDefinitions.defaultDashboards;
                    this.selectedDashboard = this.userDashboards[0];
                    this.userDashboards.forEach((defaultDashboard) => {
                        this.saveUserDashboard(defaultDashboard);
                    });
                }
            }
            else {
                this.userDashboards = CardDefinitions.initDashboardsFromAPI(layoutResponse);
            }

            this.sharedApp.userPreferences = responses[1];
        }).catch((error) => {
            this.sharedApp.showError("There was an error when trying to load your user. Please try again.", error);
            throw (error);
        });
    }

    reloadLayout() {
        //Create a new object with a new reference so the dashboard reloads
        this.userDashboards = this.sharedApp.deepCopyObject(this.userDashboards);

        //If we're reloading the layout, clear caches too
        this.sharedApp.invalidateCachesSubject.next();
    }

    getUserDashboards(): Promise<any> {
        return this.http.getWithCache("api/dashboard/dashboard", HttpRequestType.DASHBOARD, 30000);
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
        return this.http.getWithCache("api/dashboard/userPreferences", HttpRequestType.DASHBOARD, 30000);
    }

    saveUserPreferences() {
        //When we save, invalidate the cache
        this.http.invalidateCache("api/dashboard/userPreferences");
        return this.http.postDashboard("api/dashboard/userPreferences", this.sharedApp.userPreferences);
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