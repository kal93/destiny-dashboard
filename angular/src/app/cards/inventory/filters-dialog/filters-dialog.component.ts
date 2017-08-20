import { Component } from '@angular/core';
import { MdDialogRef, MdSlideToggleChange } from '@angular/material';

@Component({
    templateUrl: './filters-dialog.component.html',
    styleUrls: ['./filters-dialog.component.scss']
})
export class FiltersDialog {
    public showInventoryGroups: Array<boolean> = new Array<boolean>(10);

    setInventoryGroupVisibile(index: number, toggleEvent: MdSlideToggleChange) {
        this.showInventoryGroups[index] = toggleEvent.checked;
    }

    constructor(public dialogRef: MdDialogRef<FiltersDialog>) { }
}