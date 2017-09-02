import { Component, ViewChild } from '@angular/core';
import { MdDialog, MdDialogRef, MdTabGroup } from '@angular/material';
import { SimpleInputDialog } from '../../../shared/dialogs/simple-input.component';
//import { SharedApp } from '../../../shared/services/shared-app.service';
import { InventoryPreviewDialog } from './inventory-preview/inventory-preview-dialog.component';

import { ILoadout } from './loadouts.interface';
import { InventoryItem } from 'app/bungie/services/interface.barrel';

@Component({
    templateUrl: './loadouts-dialog.component.html',
    styleUrls: ['./loadouts-dialog.component.scss']
})
export class LoadoutsDialog {
    @ViewChild("tabGroup")
    tabGroup: MdTabGroup;

    // Inputs
    inventoryItemHashMap: Map<number, InventoryItem>;
    userLoadouts: Array<ILoadout> = [];
    restoreExpandedSections: Function;

    editMode: boolean = false;

    constructor(public dialogRef: MdDialogRef<LoadoutsDialog>, public mdDialog: MdDialog) {
        this.dialogRef.disableClose = true;
    }

    ngOnInit() {
        // Assign loadouts their actual inventory item
        for (let i = 0; i < this.userLoadouts.length; i++) {
            let userLoadout = this.userLoadouts[i];
            for (let j = 0; j < userLoadout.itemHashes.length; j++) {
                let inventoryItem = this.inventoryItemHashMap.get(userLoadout.itemHashes[i]);

                // Remove the inventoryItem if the user doesn't have it any more
                if (inventoryItem == null) {
                    userLoadout.itemHashes.splice(j, 1);
                    j--;
                }
                else
                    userLoadout.inventoryItems.push(inventoryItem);
            }
        }
    }

    createLoadout() {
        let dialogRef: MdDialogRef<SimpleInputDialog> = this.mdDialog.open(SimpleInputDialog);
        dialogRef.componentInstance.title = "Create Loadout";
        dialogRef.componentInstance.inputPlaceholder = "Loadout Name";
        dialogRef.componentInstance.inputValue = "Loadout " + (this.userLoadouts.length + 1);
        dialogRef.afterClosed().subscribe((result: string) => {
            if (result == "Save") {
                this.userLoadouts.push({ name: dialogRef.componentInstance.inputValue, itemHashes: [] });
                this.tabGroup.selectedIndex = this.userLoadouts.length - 1;
            }
        });
    }

    addItemsToLoadout(loadout: ILoadout) {
        let dialogRef: MdDialogRef<InventoryPreviewDialog> = this.mdDialog.open(InventoryPreviewDialog);
        dialogRef.componentInstance.loadout = loadout;
        dialogRef.componentInstance.inventoryItemHashMap = this.inventoryItemHashMap;
        dialogRef.afterClosed().subscribe((result: string) => {
            if (result == "Save") {

            }
        });
    }

    inventoryItemLongPress(inventoryItem: InventoryItem) {
        if (!this.editMode)
            this.editMode = true;

        this.inventoryItemClicked(inventoryItem);
    }

    inventoryItemClicked(inventoryItem: InventoryItem) {
        if (!this.editMode)
            return;

        inventoryItem.selected = !inventoryItem.selected;
    }

    selectedTabIndexChanged(targetLoadoutIndex: number) {

    }

    closeDialog() {
        this.restoreExpandedSections();
        this.dialogRef.close();
    }

}