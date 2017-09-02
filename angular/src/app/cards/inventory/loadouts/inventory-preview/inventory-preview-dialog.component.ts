import { Component, ViewChild } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { SimpleInputDialog } from '../../../../shared/dialogs/simple-input.component';

import { ILoadout } from '../loadouts.interface';
import { InventoryBucket, InventoryItem } from 'app/bungie/services/interface.barrel';

@Component({
    templateUrl: './inventory-preview-dialog.component.html',
    styleUrls: ['./inventory-preview-dialog.component.scss']
})
export class InventoryPreviewDialog {
    // Inputs
    inventoryItemHashMap: Map<number, InventoryItem>;
    loadout: ILoadout;

    inventoryBuckets: Array<InventoryBucket>;

    constructor(public dialogRef: MdDialogRef<InventoryPreviewDialog>, public mdDialog: MdDialog) {
        this.dialogRef.disableClose = true;
    }

    ngOnInit() {
        this.initInventoryBuckets();
    }

    initInventoryBuckets() {
        this.inventoryBuckets = new Array<InventoryBucket>();

    }

    closeDialog() {
        this.dialogRef.close();
    }

}