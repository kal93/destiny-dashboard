import { Component } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { InventoryItem } from 'app/bungie/services/interface.barrel';


@Component({
    templateUrl: './transfer-quantity-dialog.component.html',
    styleUrls: ['./transfer-quantity-dialog.component.scss']
})
export class TransferQuantityDialog {
    public inventoryItems: Array<InventoryItem>;

    constructor(public dialogRef: MdDialogRef<TransferQuantityDialog>) { }

    ngOnInit() {
        this.inventoryItems.forEach((inventoryItem) => {
            if (inventoryItem.transferQuantity == null && inventoryItem.quantity > 1)
                inventoryItem.transferQuantity = inventoryItem.quantity;
        });
    }

    incrementBy(inventoryItem: InventoryItem, increment: number) {
        let newQuantity = inventoryItem.transferQuantity + increment;
        if (newQuantity > inventoryItem.quantity)
            inventoryItem.transferQuantity = inventoryItem.quantity;
        else {
            inventoryItem.transferQuantity = newQuantity;
            if (inventoryItem.transferQuantity < 1)
                inventoryItem.transferQuantity = 1;
        }
    }
}