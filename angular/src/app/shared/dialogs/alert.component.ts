import { Component } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
    template: `<h1 md-dialog-title>{{title}}</h1>
                <div md-dialog-content>{{message}}</div>
                <div md-dialog-actions [style.justify-content]="'flex-end'">
                    <button md-button md-dialog-close="{{confirmText}}" [style.color]="'#2196F3'">{{confirmText}}</button>
                </div>`,
    styles: [".mat-dialog-actions{ margin: 10px -10px 0 0; padding-bottom: 0;}"]
})
export class AlertDialog {
    public title: string;
    public message: string;
    public confirmText: string = "Ok";
    constructor(public dialogRef: MdDialogRef<AlertDialog>) { }
} 