import { Component, ViewChild } from '@angular/core';
import { MdRadioChange, MdSidenav } from '@angular/material';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { SharedBungie } from '../bungie/shared-bungie.service';
import { SharedDashboard } from '../dashboard/shared-dashboard.service';
import { SharedApp } from '../shared/services/shared-app.service';
import { fadeIn } from '../shared/animations';

import { environment } from '../../environments/environment';
import { CardDefinitions } from '../cards/_base/card-definition';
import { IUserDashboard } from '../cards/_base/card.interface';
import { ISubNavItem, IToolbarItem } from '../nav/nav.interface';

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'dd-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  animations: [fadeIn()],
})
export class NavComponent {
  @ViewChild("mainNav")
  mainNav: MdSidenav;

  @ViewChild("subNav")
  subNav: MdSidenav;

  // Application events
  toggleMainNavSubscription: Subscription;
  toggleSubNavSubscription: Subscription;
  logOutSubscription: Subscription;

  //Remember dashboard menu state when navigating back to dashboard
  quickLinksCollapsed: boolean = false;
  dashboardsCollapsed: boolean = false;
  helpCollapsed: boolean = false;
  routeChangedFromNav: boolean = false;
  openMenuOnDashboardLoad: boolean = false;

  constructor(private activatedRoute: ActivatedRoute, public sharedBungie: SharedBungie, public sharedDashboard: SharedDashboard, public sharedApp: SharedApp, public router: Router) {
    //Application events
    this.toggleMainNavSubscription = this.sharedApp.toggleMainNavSubject.subscribe((open: boolean) => { open ? this.mainNav.open() : this.mainNav.close() });
    this.toggleSubNavSubscription = this.sharedApp.toggleSubNavSubject.subscribe((open: boolean) => { open ? this.subNav.open() : this.subNav.close() });
    this.logOutSubscription = this.sharedApp.logOutSubject.subscribe(() => { this.logOut(); });

    //Handle router end event
    router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        //Reset nav items as we're going to a new component
        this.sharedApp.subNavItems = new Array<ISubNavItem>();
      }
      else if (e instanceof NavigationEnd) {
        //Scroll to top on route change        
        window.scrollTo(0, 0);

        //Reset toolbarItems when nav is changed
        this.sharedApp.toolbarItems = new Array<IToolbarItem>();

        //If the route change was launched from the dashboard menu, set a flag so the dashboard menu is re-opened next time it's loaded 
        this.openMenuOnDashboardLoad = false;
        if (this.routeChangedFromNav) {
          this.routeChangedFromNav = false;
          this.openMenuOnDashboardLoad = true;
        }

        //Set pageTitle from router data, except for Dashboard
        this.sharedApp.pageTitle = activatedRoute.root.firstChild.snapshot.data['title'];
      }
    })
  }

  ngOnDestroy() {
    this.toggleMainNavSubscription.unsubscribe();
  }

  logIn() {
    //Remove existing auth data
    this.sharedApp.removeLocalStorage("accessToken", "accessTokenExpires", "membershipId", "bungieAuthCode");

    //Generate a random state variable and save to local storage so it can be verified later
    let randomState = Math.random().toString(36).substring(7, 15) + Math.random().toString(36).substring(7, 15);

    //Store it to localStorage. Don't want to compress it, so we won't use sharedApp.setLocalStorage
    localStorage.setItem("bungieAuthState", randomState);

    //Send user to Bungie's login page
    window.location.href = "https://www.bungie.net/en/oauth/authorize?client_id=" + environment.bungieClientId + "&response_type=code&state=" + randomState;
  }

  logOut() {
    this.sharedBungie.deleteAccessToken();
    this.sharedApp.accessToken = this.sharedApp.accessTokenExpires = this.sharedApp.membershipId = this.sharedBungie.bungieNetUser = this.sharedBungie.destinyMemberships = null;
    this.sharedApp.removeLocalStorage("accessToken", "accessTokenExpires", "membershipId", "bungieAuthCode");
    this.sharedDashboard.userDashboards = CardDefinitions.defaultDashboards;
    this.sharedApp.invalidateCachesSubject.next();
    this.backToDashboard();
  }

  //Main Nav
  backToDashboard() {
    if (this.openMenuOnDashboardLoad)
      this.mainNav.open();
    this.router.navigate(['/dashboard']);
  }

  navigateToRoute(route: string) {
    this.routeChangedFromNav = true;
    this.router.navigate([route]);
    this.mainNav.close();
  }

  selectDashboard(dashboard: IUserDashboard) {
    this.sharedDashboard.selectedDashboard = dashboard;
    this.router.navigate(['/dashboard']);
    this.mainNav.close();
  }

  // Sub Nav
  subNavItemClicked(subNavItem: ISubNavItem) {
    subNavItem.selectedCallback(subNavItem);
    this.subNav.close();
  }

  toolbarItemClicked(toolbarItem: IToolbarItem) {
    toolbarItem.selectedCallback(toolbarItem);
  }

  membershipRadioChanged(radioChangeEvent: MdRadioChange) {
    this.sharedApp.userPreferences.membershipIndex = radioChangeEvent.value;
    this.sharedDashboard.saveUserPreferences();
    this.sharedDashboard.reloadLayout();
  }

}