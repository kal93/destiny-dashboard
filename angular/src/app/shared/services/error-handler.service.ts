import { ErrorHandler, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import * as StackTrace from 'stacktrace-js';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    private stackdriverUrl = "https://clouderrorreporting.googleapis.com/v1beta1/projects/";
    private projectId: string = "destiny-dashboard";
    private apiKey: string = "AIzaSyBGHTJPlCZku1JBNKLIydaNZtukPlfmDUs";

    constructor(private http: HttpClient) {
        // Register as global error handler
        window.onerror = (message, source, lineno, colno, error) => {
            if (error) this.handleError(error);
            return true;
        };
    }

    handleError(error) {
        if (environment.production)
            this.logToStackdriver(error);
        else
            console.error(error);
    }

    private logToStackdriver(error) {
        let payload: any = {};
        payload.serviceContext = { service: 'web' };
        payload.context = {
            httpRequest: {
                userAgent: window.navigator.userAgent,
                url: window.location.href
            }
        };

        // This will use sourcemaps and normalize the stack frames
        try {
            StackTrace.fromError(error).then((stack) => {
                payload.message = error.toString();
                for (let s = 0; s < stack.length; s++) {
                    payload.message += '\n';
                    payload.message += ['    at ', stack[s].getFunctionName(), ' (', stack[s].getFileName(), ':', stack[s].getLineNumber(), ':', stack[s].getColumnNumber(), ')'].join('');
                }
                this.sendErrorPayload(payload);
            });
        }
        catch (e) {
            console.error(" StackTrace.fromError failed");
        }
    };

    private sendErrorPayload(payload) {
        console.error(payload);
        let url = this.stackdriverUrl + this.projectId + "/events:report?key=" + this.apiKey;

        return this.http.post(url, JSON.stringify(payload)).toPromise().then((response) => {
            return response;
        }).catch((error) => {
            this.handleError(error);
        });
    }
}