import { Component } from '@angular/core';
import { MdDialogRef, MdSlideToggleChange } from '@angular/material';
import { LoadoutsService } from './loadouts.service';

import { ILoadout } from './loadouts.interface';
import { InventoryItem } from 'app/bungie/services/interface.barrel';

@Component({
    templateUrl: './loadouts-dialog.component.html',
    styleUrls: ['./loadouts-dialog.component.scss'],
    providers: [LoadoutsService]
})
export class LoadoutsDialog {
    public membershipId: string;
    public inventoryItemHashMap = new Map<number, InventoryItem>();

    public userLoadouts: Array<ILoadout> = [];

    constructor(public dialogRef: MdDialogRef<LoadoutsDialog>, private loadoutsService: LoadoutsService) {
    }

    ngOnInit() {
        this.loadoutsService.getUserLoadouts(this.membershipId).then((userLoadouts: Array<ILoadout>) => {
            this.userLoadouts = userLoadouts;

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
        });
    }

    createLoadout() {

    }

    selectedTabIndexChanged(targetLoadoutIndex: number) {
    }

    closeDialog() {
        this.dialogRef.close();
    }

}