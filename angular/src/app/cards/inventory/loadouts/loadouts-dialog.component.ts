import { Component } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfirmDialog } from 'app/shared/dialogs/confirm.component';
import { InventoryPreviewDialog } from './inventory-preview/inventory-preview-dialog.component';
import { SimpleInputDialog } from '../../../shared/dialogs/simple-input.component';

import { Loadout } from './loadouts.interface';
import { IAccountSummary, InventoryItem } from 'app/bungie/services/interface.barrel';

import { fadeInChildren } from 'app/shared/animations';

@Component({
    templateUrl: './loadouts-dialog.component.html',
    styleUrls: ['./loadouts-dialog.component.scss'],
    animations: [fadeInChildren()]
})
export class LoadoutsDialog {
    // Inputs
    userLoadouts: Array<Loadout> = [];
    accountSummary: IAccountSummary;
    inventoryItemHashMap: Map<string, InventoryItem>;
    restoreExpandedSections: Function;
    applyLoadout: Function;

    private isChanged: boolean = false;

    MAX_LOADOUTS: number = 5;

    constructor(public dialogRef: MdDialogRef<LoadoutsDialog>, public domSanitizer: DomSanitizer, public mdDialog: MdDialog) {
        this.dialogRef.disableClose = true;
    }

    createLoadout() {
        if (this.userLoadouts.length >= this.MAX_LOADOUTS)
            return;
        let dialogRef: MdDialogRef<SimpleInputDialog> = this.mdDialog.open(SimpleInputDialog);
        dialogRef.componentInstance.title = "Create Loadout";
        dialogRef.componentInstance.inputPlaceholder = "Loadout Name";
        dialogRef.componentInstance.inputValue = "Loadout " + (this.userLoadouts.length + 1);
        dialogRef.afterClosed().subscribe((result: string) => {
            if (result == "Save") {
                this.userLoadouts.push({ name: dialogRef.componentInstance.inputValue, inventoryItems: new Array<InventoryItem>() });
                this.isChanged = true;
            }
        });
    }

    deleteLoadout(loadout: Loadout) {
        let dialogRef = this.mdDialog.open(ConfirmDialog, { height: '205px', width: '290px', });
        dialogRef.componentInstance.title = "Confirm";
        dialogRef.componentInstance.message = "Are you sure you want to delete " + loadout.name + "?";
        dialogRef.componentInstance.optionLeft = "Cancel";
        dialogRef.componentInstance.optionRight = "Yes";

        dialogRef.afterClosed().subscribe((result: string) => {
            if (result == "Yes") {
                this.isChanged = true;
                this.userLoadouts.splice(this.userLoadouts.indexOf(loadout), 1);
            }
        });
    }

    addItemsToLoadout(loadout: Loadout) {
        let dialogRef: MdDialogRef<InventoryPreviewDialog> = this.mdDialog.open(InventoryPreviewDialog);
        dialogRef.componentInstance.selectedInventoryItems = loadout.inventoryItems;
        dialogRef.componentInstance.inventoryItemHashMap = this.inventoryItemHashMap;
        dialogRef.componentInstance.acceptableBucketGroups = ["Primary Weapons", "Special Weapons", "Heavy Weapons", "Ghost", "Vehicle", "Shaders", "Emotes"];
        dialogRef.componentInstance.title = "Edit " + loadout.name;
        dialogRef.afterClosed().subscribe(() => {
            this.isChanged = true;
        });
    }

    applyLoadoutProxy(loadout: Loadout, destCharacterIndex: number) {
        this.applyLoadout(loadout, destCharacterIndex);
        this.dialogRef.close(this.isChanged);
    }

    closeDialog() {
        this.restoreExpandedSections();
        this.dialogRef.close(this.isChanged);
    }

}