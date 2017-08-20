import { Component } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
    template: `<h1 md-dialog-title>{{title}}</h1>
                <div md-dialog-content>                
                    <md-input-container>
                        <input mdInput [(ngModel)]="inputValue" [placeholder]="inputPlaceholder">
                    </md-input-container>
                </div>
                <div md-dialog-actions [style.justify-content]="'flex-end'">
                    <button md-button md-dialog-close="cancel">Cancel</button>
                    <button md-button md-dialog-close="Save" [style.color]="'#2196F3'">Save</button>
                </div>`,
    styles: [".mat-dialog-actions{ margin: 10px -10px 0 0; padding-bottom: 0;}"]
})
export class SimpleInputDialog {
    public title: string;
    public inputPlaceholder: string;
    public inputValue: string;

    constructor(public dialogRef: MdDialogRef<SimpleInputDialog>) { }
} 