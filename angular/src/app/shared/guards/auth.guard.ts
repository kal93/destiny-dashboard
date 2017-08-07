import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { SharedApp } from '../services/shared-app.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router, public sharedApp: SharedApp) { }

    canActivate(route: ActivatedRouteSnapshot) {
        if (this.sharedApp.accessToken == null) {
            this.sharedApp.showWarning("You must be logged in to access " + route.data['title']);
            this.router.navigate(['/dashboard']);
            return false;
        }

        return true;
    }
}