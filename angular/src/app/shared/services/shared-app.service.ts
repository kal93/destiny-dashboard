import { Injectable } from '@angular/core';
import { MdDialog, MdSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GlobalErrorHandler } from './error-handler.service';
import { LZString } from '../utilities/lz-string';
import { environment } from '../../../environments/environment';
import { AlertDialog } from '../../shared/dialogs/alert.component';

import { ISubNavItem, IToolbarItem } from '../../nav/nav.interface';
import { delayBy } from '../decorators';

import { Subject } from 'rxjs/Subject';

/** This Injectable manages the application */
@Injectable()
export class SharedApp {
    windowHeight: number = Math.max(document.body.clientHeight, window.innerHeight);
    windowWidth: number = document.body.clientWidth;

    //Application Events
    windowResizedSubject = new Subject<void>();
    toggleMainNavSubject = new Subject<boolean>();
    toggleSubNavSubject = new Subject<boolean>();
    tutorialEditDashboardSubject = new Subject<boolean>();
    tutorialAddCardSubject = new Subject<boolean>();
    invalidateCachesSubject = new Subject<void>();
    logOutSubject = new Subject<void>();

    // Application specific
    public appInitialized: boolean = false;
    public localStorageDisabled: boolean = false;
    public pageTitle: string = "DestinyDashboard.net";
    public isTutorialMode: boolean = false;
    public toolbarItems = new Array<IToolbarItem>();
    public subNavItems = new Array<ISubNavItem>();
    public showLoadingIds = new Map<any, boolean>();
    public languageKey: string = "en";

    // Application wide Bungie variables
    public accessToken: string;
    public accessTokenExpires: number;
    public membershipId: number;

    // Application wide dashboard variables
    public userPreferences: {
        membershipIndex: number
    };

    constructor(public mdDialog: MdDialog, private globalErrorHandler: GlobalErrorHandler, protected router: Router, public snackBar: MdSnackBar, private toastrService: ToastrService) {
        try {
            // Test localStorage to alert user that if they are browsing in private mode this site will not work
            localStorage.setItem("test", "test");
            localStorage.removeItem("test");
        }
        catch (error) {
            this.localStorageDisabled = true;
            let dialogRef = this.mdDialog.open(AlertDialog, { height: '250px', width: '320px', });
            dialogRef.componentInstance.title = "Private Mode";
            dialogRef.componentInstance.message = "It looks like your browser is in private mode, or does not support Local Storage. This site may not work properly without Local Storage.";
        }

        this.accessToken = this.getLocalStorage("accessToken");
        this.accessTokenExpires = +this.getLocalStorage("accessTokenExpires", -1);
        this.membershipId = +this.getLocalStorage("membershipId", -1);
        this.onResize();
    }

    onResize() {
        let viewport = document.querySelector("meta[name=viewport]");
        if (screen.width < 420)
            viewport.setAttribute('content', 'width=420, user-scalable=no, initial-scale=' + screen.width / 420);
        else
            viewport.setAttribute('content', 'width=device-width, user-scalable=no, initial-scale=1');

        this.windowHeight = Math.max(document.body.clientHeight, window.innerHeight);
        this.windowWidth = document.body.clientWidth;
        this.windowResizedSubject.next();
    }

    startTutorial() {
        this.router.navigate(['/dashboard']);
        this.toggleMainNavSubject.next(false);
        this.tutorialAddCardSubject.next(false);
        this.isTutorialMode = true;
        this.tutorialStep1();
    }

    private tutorialStep1() {
        this.toggleMainNavSubject.next(true);
        this.snackBar.open("The main menu allows you to log in or quickly jump to one of your dashboards. Logging in will save your dashboards to your Bungie account.", "Next").afterDismissed().subscribe(() => {
            this.toggleMainNavSubject.next(false);
            this.tutorialStep2();
        });
    }

    private tutorialStep2() {
        this.toggleSubNavSubject.next(true);
        this.snackBar.open("The sub menu has options for the page you're currently on.", "Next").afterDismissed().subscribe(() => {
            this.tutorialStep3();
        });
    }

    private tutorialStep3() {
        this.snackBar.open("The sub menu for the dashboard allows you to create a dashboard or edit the current dashboard. Let's see how to edit a dashboard!", "Next").afterDismissed().subscribe(() => {
            this.toggleSubNavSubject.next(false);
            this.tutorialEditDashboardSubject.next(true);
            this.tutorialStep5();
        });
    }

    private tutorialStep5() {
        this.snackBar.open("You can set the position and size of cards, add or remove cards, and rename your dashboard. Let's see how to add a card!", "Next").afterDismissed().subscribe(() => {
            this.toggleSubNavSubject.next(false);
            this.tutorialAddCardSubject.next(true);
            this.tutorialStep6();
        });
    }

    private tutorialStep6() {
        this.snackBar.open("You can swipe through cards to browse. Cards you have already added will not appear.", "Done").afterDismissed().subscribe(() => {
            this.tutorialAddCardSubject.next(false);
            this.tutorialEditDashboardSubject.next(false);
            this.isTutorialMode = false;
        });
    }

    getLocalStorage(key: string, defaultValue?: any): any {
        if (this.localStorageDisabled) return defaultValue;
        let localStorageValue = localStorage.getItem(key);
        if (environment.production)
            localStorageValue = LZString.decompressFromUTF16(localStorageValue);
        if (typeof defaultValue === "number") {
            let parsed = Number.parseInt(localStorageValue);
            if (isNaN(parsed))
                return defaultValue;
            return parsed;
        }
        return localStorageValue || defaultValue;
    }

    setLocalStorage(key: string, value: any) {
        if (this.localStorageDisabled) return;
        try {
            if (environment.production)
                value == null ? localStorage.removeItem(key)
                    : localStorage.setItem(key, LZString.compressToUTF16(value.toString()));
            else
                value == null ? localStorage.removeItem(key)
                    : localStorage.setItem(key, value.toString());
        }
        catch (error) {
            console.log("Could not set local storage. Quota may be exceeded.");
            this.globalErrorHandler.handleError(error);
        }
    }

    getLocalStorageMap(key: string, defaultValue?: Map<any, any>) {
        if (this.localStorageDisabled) return defaultValue;
        let localStorageValue = this.getLocalStorage(key);
        if (localStorageValue == null)
            return defaultValue;
        try {
            let storedMap = new Map<any, any>();
            let storedArray: Array<any> = JSON.parse(localStorageValue);
            storedArray.forEach(cacheEntry => {
                storedMap.set(cacheEntry[0], cacheEntry[1]);
            });
            return storedMap;
        }
        catch (e) {
            return defaultValue;
        }
    }

    getLocalStorageAsJsonObject(key: string, defaultValue?: any): any {
        if (this.localStorageDisabled) return defaultValue;
        let localStorageValue = this.getLocalStorage(key, null);

        // If local storage value doesn't exist, return the default value
        if (localStorageValue == null) return defaultValue;

        // Try to parse the local storage value as a JSON object
        try { return JSON.parse(localStorageValue); }

        // If parsing fails, return default value
        catch (e) { return defaultValue; }
    }

    removeLocalStorage(...keys) {
        if (this.localStorageDisabled) return;
        for (let i = 0; i < keys.length; i++)
            localStorage.removeItem(keys[i]);
    }

    setSessionStorage(key: string, value: any) {
        if (this.localStorageDisabled) return;
        sessionStorage.setItem(key, value);
    }

    getSessionStorage(key: string, defaultValue?: any) {
        if (this.localStorageDisabled) return defaultValue;

        let sessionStorageValue = sessionStorage.getItem(key);
        if (sessionStorageValue == null)
            return defaultValue;
        return sessionStorageValue
    }

    @delayBy(10)
    showLoading(loadingId: any) {
        this.showLoadingIds.set(loadingId, true);
    }

    @delayBy(50)
    hideLoading(loadingId: any) {
        if (this.showLoadingIds.has(loadingId))
            this.showLoadingIds.delete(loadingId);
    }

    openExternalLink(url: string) {
        window.open(url, "_blank");
    }

    @delayBy(10)
    showError(errorMessage: string, error?: any) {
        this.toastrService.error(errorMessage, null, { progressBar: true, closeButton: true, timeOut: 5000, messageClass: 'toast-message' });

        this.globalErrorHandler.handleError(error);
    }

    @delayBy(10)
    showInfo(infoMessage: string, options?: any) {
        this.toastrService.info(infoMessage, null, options);
    }

    @delayBy(10)
    showInfoOnce(infoMessage: string) {
        if (sessionStorage.getItem(infoMessage))
            return;
        this.toastrService.info(infoMessage);
        sessionStorage.setItem(infoMessage, "1");
    }

    @delayBy(10)
    showWarning(warnMessage: string, options?: any) {
        this.toastrService.warning(warnMessage, null, options);
    }

    @delayBy(10)
    showSuccess(successMessage: string) {
        this.toastrService.success(successMessage);
    }

    deepCopyObject(objToCopy: any) {
        return JSON.parse(JSON.stringify(objToCopy));
    }
} 