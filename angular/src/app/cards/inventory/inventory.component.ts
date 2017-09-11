import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MdDialog } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { SharedBungie } from 'app/bungie/shared-bungie.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { FiltersDialog } from './filters-dialog/filters-dialog.component';
import { LoadoutsDialog } from './loadouts/loadouts-dialog.component';
import { TransferQuantityDialog } from './transfer-quantity-dialog/transfer-quantity-dialog.component';
import { InventoryUtils } from 'app/bungie/services/service.barrel';

import { ISubNavItem } from 'app/nav/nav.interface';
import { Loadout } from './loadouts/loadouts.interface';

import { DestinyProfileService, InventoryItemService } from 'app/bungie/services/service.barrel';
import {
    CharacterBase, DestinyMembership, InventoryBucket, InventoryItem, IAccountSummary, IProfileSummary, InventoryItemTransferResult
} from 'app/bungie/services/interface.barrel';

import { expandInShrinkOut, fadeInFromTop } from 'app/shared/animations';
import { delayBy } from 'app/shared/decorators';

import 'rxjs/add/operator/debounceTime';

@Component({
    selector: 'dd-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: ['../_base/card.component.scss', './inventory.component.scss'],
    animations: [expandInShrinkOut(), fadeInFromTop()]
})

export class InventoryComponent extends CardComponent {
    InventoryUtils = InventoryUtils;

    CARD_DEFINITION_ID = 6;

    isInitialized: boolean = false;

    // Get the selected membership (Xbox, PSN, Blizzard)
    private selectedMembership: DestinyMembership;

    // Account summary so we can get the characters associated to this account
    accountSummary: IAccountSummary;

    // Map of all inventoryItems for a player
    private inventoryItemHashMap = new Map<string, InventoryItem>();

    // Array of Map of <bucketHash, bucket>. Array position matches caracter position in this.accountSummary.characterData. Vault is always [3]
    private bucketsMap: Array<Map<number, InventoryBucket>> = new Array<Map<number, InventoryBucket>>(4);

    // Array of character buckets for display in .html. Array position matches caracter position in this.accountSummary.characterData. Character[Buckets]
    bucketsArray: Array<Array<InventoryBucket>> = new Array<Array<InventoryBucket>>(4);

    // Character/Vault[BucketGroup[Buckets]]
    bucketGroupsArray: Array<Array<Array<InventoryBucket>>> = new Array<Array<Array<InventoryBucket>>>(4);

    // Keep track if a user has collapsed a section
    expandedSections: Array<boolean>;

    // If user has long pressed an inventory item, we are in edit mode
    editMode: boolean = false;

    // Array of selected inventory items
    selectedInventoryItems = new Array<InventoryItem>();
    private refreshIndexes: Array<boolean> = [false, false, false, false];

    // Filtering
    searchText: string = '';
    searchTextForm = new FormControl();
    showInventoryGroups: Array<boolean>;

    //Loadouts    
    public userLoadouts: Array<Loadout> = [];

    constructor(private destinyProfileService: DestinyProfileService, public domSanitizer: DomSanitizer,
        private inventoryItemService: InventoryItemService, private mdDialog: MdDialog, public manifestService: ManifestService,
        private sharedBungie: SharedBungie, public sharedApp: SharedApp, private DestinyProfileService: DestinyProfileService) {
        super(sharedApp);
    }

    ngOnInit() {
        super.ngOnInit();
        if (this.sharedBungie.destinyMemberships == null)
            return;

        // Get localStorage variables
        this.expandedSections = this.getCardLocalStorageAsJsonObject("expandedSections", [false, false, false, false]);
        this.showInventoryGroups = this.getCardLocalStorageAsJsonObject("showInventoryGroups", [false, true, true, false, true, true, true, false, false, true]);

        // Set our membership (XBL, PSN, Blizzard)
        this.selectedMembership = this.sharedBungie.destinyMemberships[this.sharedApp.userPreferences.membershipIndex];

        this.getFullInventory().then(() => {
            // Loadouts only available in fullscreen mode
            if (this.isFullscreen) {
                this.setSubNavItems();
                this.sharedApp.showInfoOnce("Press and hold an item to enter multi-transfer mode.");
            }
        });
        this.initSearch();
    }

    getFullInventory(): Promise<any> {
        return new Promise((resolve, reject) => {
            // Get Account Summary to get the list of available characters
            this.destinyProfileService.getAccountSummary(this.selectedMembership).then((accountSummary: IAccountSummary) => {
                this.accountSummary = accountSummary;
                if (this.accountSummary == null) {
                    this.sharedApp.showError("Account not found for Destiny 2!");
                    return;
                }

                // Init buckets
                this.bucketGroupsArray = new Array<Array<Array<InventoryBucket>>>(4);
                this.bucketsMap = new Array<Map<number, InventoryBucket>>(4);

                // Load character data
                let inventoryPromises = new Array<Promise<any>>();
                for (let i = 0; i < this.accountSummary.characterData.length; i++)
                    inventoryPromises.push(this.loadCharacterInventory(i));

                inventoryPromises.push(this.loadVaultInventory());

                Promise.all(inventoryPromises).then(() => {
                    this.applyFilter();
                    this.isInitialized = true;
                    resolve();
                });

            }).catch(error => {
                this.sharedApp.showError("There was an error getting the account summary.", error);
                reject(error);
            });
        });
    }

    refreshCharacterInventory(characterIndex: number) {
        this.loadCharacterInventory(characterIndex).then(() => {
            let bucketGroups = this.bucketGroupsArray[characterIndex];
            InventoryUtils.applyFilterToBucketGroups(this.searchText, this.showInventoryGroups, bucketGroups, false);
        });
    }

    refreshVaultInventory() {
        this.loadVaultInventory().then(() => {
            let bucketGroups = this.bucketGroupsArray[3];
            InventoryUtils.applyFilterToBucketGroups(this.searchText, this.showInventoryGroups, bucketGroups, false);
        });
    }

    loadCharacterInventory(characterIndex: number): Promise<any> {
        let character: CharacterBase = this.accountSummary.characterData[characterIndex];
        return this.destinyProfileService.getCharacterInventorySummary(this.selectedMembership, character.characterId).then((inventoryResponse) => {
            let allInventoryItems = inventoryResponse.inventory.data.items;
            allInventoryItems = allInventoryItems.concat(inventoryResponse.equipment.data.items);
            this.populateBuckets(characterIndex, allInventoryItems);
        }).catch((error) => {
            this.sharedApp.showError("Error loading character inventory", error);
        });
    }

    loadVaultInventory(): Promise<any> {
        return this.destinyProfileService.getProfileSummary(this.selectedMembership).then((vaultSummaryResponse: IProfileSummary) => {
            this.populateBuckets(3, vaultSummaryResponse.profileInventory.data.items);
        }).catch((error) => {
            this.sharedApp.showError("Error loading vault inventory", error);
        });
    }

    populateBuckets(bucketIndex: number, inventoryItems: Array<InventoryItem>) {
        this.bucketsMap[bucketIndex] = new Map<number, InventoryBucket>();
        this.bucketsArray[bucketIndex] = new Array<InventoryBucket>();
        InventoryUtils.populateBucketMapFromResponse(bucketIndex, this.manifestService, inventoryItems, this.inventoryItemHashMap, this.bucketsMap[bucketIndex]);
        InventoryUtils.populateBucketArrayFromMap(this.bucketsMap[bucketIndex], this.bucketsArray[bucketIndex]);
        InventoryUtils.groupBuckets(this.bucketGroupsArray, this.bucketsArray[bucketIndex], bucketIndex);
    }

    initSearch() {
        this.searchTextForm.valueChanges.debounceTime(400).subscribe((newSearchText) => {
            this.searchText = newSearchText;

            let charAddedToEnd: boolean = false;
            if (newSearchText.length - 1 == this.searchText.length && newSearchText.startsWith(this.searchText))
                charAddedToEnd = true;

            this.searchText = newSearchText;
            this.applyFilter(charAddedToEnd);
        });
    }

    applyFilter(skipAlreadyFiltered: boolean = false) {
        // Apply filter to each characters bucket groups
        for (let characterIndex = 0; characterIndex < this.accountSummary.characterData.length; characterIndex++) {
            // Bucket groups for character
            let bucketGroups = this.bucketGroupsArray[characterIndex];
            InventoryUtils.applyFilterToBucketGroups(this.searchText, this.showInventoryGroups, bucketGroups, skipAlreadyFiltered);
        }

        // Apply filter to vault buckets
        InventoryUtils.applyFilterToBucketGroups(this.searchText, this.showInventoryGroups, this.bucketGroupsArray[3], skipAlreadyFiltered);
    }

    collapseSection(sectionIndex: number) {
        this.expandedSections[sectionIndex] = !this.expandedSections[sectionIndex];
        this.setCardLocalStorage("expandedSections", JSON.stringify(this.expandedSections));
    }

    inventoryItemLongPress(inventoryItem: InventoryItem) {
        if (!InventoryUtils.isItemTransferrable(inventoryItem)) {
            this.sharedApp.showWarning("This item is not transferrable", { timeOut: 1500 });
            return;
        }

        if (!this.editMode)
            this.setEditMode(true);

        this.inventoryItemClicked(inventoryItem);
    }

    inventoryItemClicked(inventoryItem: InventoryItem) {
        if (!this.editMode)
            return;

        if (!InventoryUtils.isItemTransferrable(inventoryItem)) {
            this.sharedApp.showWarning("This item is not transferrable", { timeOut: 1500 });
            return;
        }

        inventoryItem.selected = !inventoryItem.selected;
        if (inventoryItem.selected)
            this.selectedInventoryItems.push(inventoryItem);
        else {
            // If deselected, remove from selected array
            this.selectedInventoryItems.splice(this.selectedInventoryItems.indexOf(inventoryItem), 1);

            // If deselecting last item, turn off edit mode
            if (this.selectedInventoryItems.length == 0)
                this.setEditMode(false);
        }
    }

    setEditMode(editOn: boolean) {
        this.editMode = editOn;

        // Deselect all inventory items if we're coming out of edit mode
        if (!this.editMode)
            this.selectedInventoryItems.forEach(selectedInventoryItem => { selectedInventoryItem.selected = false; });

        this.selectedInventoryItems = new Array<InventoryItem>();
    }

    setSubNavItems() {
        this.sharedApp.subNavItems = new Array<ISubNavItem>();

        this.sharedApp.subNavItems.push({
            title: 'Filters', materialIcon: 'filter_list',
            selectedCallback: (subNavItem: ISubNavItem) => {
                let dialogRef = this.mdDialog.open(FiltersDialog);
                dialogRef.componentInstance.showInventoryGroups = this.showInventoryGroups;
                dialogRef.afterClosed().subscribe((result: string) => {
                    this.setCardLocalStorage("showInventoryGroups", JSON.stringify(this.showInventoryGroups));
                    this.applyFilter();
                });
            }
        });

        this.sharedApp.subNavItems.push({ title: '_spacer', materialIcon: '' });

        this.sharedApp.subNavItems.push({
            title: 'Loadouts', materialIcon: 'build',
            selectedCallback: (subNavItem: ISubNavItem) => {
                // Close all characters to clear up the dom
                this.expandedSections = [false, false, false, false];

                let dialogRef = this.mdDialog.open(LoadoutsDialog);
                dialogRef.componentInstance.destinyMembership = this.selectedMembership;
                dialogRef.componentInstance.accountSummary = this.accountSummary;
                dialogRef.componentInstance.inventoryItemHashMap = this.inventoryItemHashMap;
                dialogRef.componentInstance.restoreExpandedSections = () => {
                    this.expandedSections = this.getCardLocalStorageAsJsonObject("expandedSections", [false, false, false, false]);
                }
                dialogRef.componentInstance.applyLoadout = ((loadout: Loadout, destCharacterIndex: number) => {
                    // Make a copy of the loadout items so we don't remove them when they're being transferred
                    let loadoutItemsCopy = [];
                    loadout.inventoryItems.forEach(inventoryItem => loadoutItemsCopy.push(inventoryItem));
                    this.transferItemsToIndex(loadoutItemsCopy, destCharacterIndex);
                });
            }
        });
    }

    transferItemsToIndex(inventoryItems: Array<InventoryItem>, destCharacterIndex: number) {
        let showTransferQuantityDialog: boolean = false;
        for (let i = 0; i < inventoryItems.length; i++) {
            let inventoryItem = inventoryItems[i];
            // Don't transfer things that already exist in their destination
            if (inventoryItem.characterIndex == destCharacterIndex) {
                inventoryItem.selected = false;
                inventoryItems.splice(i, 1);
                i--;
                continue;
            }

            if (inventoryItem.quantity > 1) {
                showTransferQuantityDialog = true;
                break;
            }
        }
        if (inventoryItems.length == 0) {
            this.setEditMode(false);
            return;
        }

        if (showTransferQuantityDialog) {
            let dialogRef = this.mdDialog.open(TransferQuantityDialog);
            dialogRef.componentInstance.inventoryItems = inventoryItems;
            dialogRef.afterClosed().subscribe((result: string) => {
                if (result == "Transfer")
                    this.transferItemsToIndexRecurse(inventoryItems, destCharacterIndex, true);
            });
        }
        else
            this.transferItemsToIndexRecurse(inventoryItems, destCharacterIndex, true);
    }

    private transferItemsToIndexRecurse(inventoryItems: Array<InventoryItem>, destCharacterIndex: number, firstRecursion: boolean) {
        // First time recursive was called
        let loadingId = -34515;
        if (firstRecursion)
            this.sharedApp.showLoading(loadingId);

        if (inventoryItems.length > 0) {
            let inventoryItem = inventoryItems.pop();
            inventoryItem.selected = false;
            this.transferSingleItemToIndex(inventoryItem, destCharacterIndex).then(() => {
                // Call this function again until there are no items left
                setTimeout(() => { this.transferItemsToIndexRecurse(inventoryItems, destCharacterIndex, false); }, InventoryItemService.TRANSFER_DELAY);
            }).catch(() => {
                setTimeout(() => { this.transferItemsToIndexRecurse(inventoryItems, destCharacterIndex, false); }, InventoryItemService.TRANSFER_DELAY);
            });
        }
        else {
            // Refresh required inventory locations
            if (this.refreshIndexes[0]) this.refreshCharacterInventory(0);
            if (this.refreshIndexes[1]) this.refreshCharacterInventory(1);
            if (this.refreshIndexes[2]) this.refreshCharacterInventory(2);
            if (this.refreshIndexes[3]) this.refreshVaultInventory();

            this.refreshIndexes = [false, false, false, false];
            this.setEditMode(false);
            this.sharedApp.hideLoading(loadingId);
        }
    }

    transferSingleItemToIndex(inventoryItem: InventoryItem, destCharacterIndex: number): Promise<any> {
        let loadingId = -56489;
        this.sharedApp.showLoading(loadingId);

        return new Promise<any>((resolve, reject) => {
            if (inventoryItem.transferQuantity == null || inventoryItem.transferQuantity == 0)
                inventoryItem.transferQuantity = inventoryItem.quantity;

            this.inventoryItemService.setData(this.bucketsMap, this.selectedMembership, this.accountSummary);

            // Don't attempt to transfer if destination bucket is full
            let destBucket: InventoryBucket = this.bucketsMap[destCharacterIndex].get(inventoryItem.itemValue.inventory.bucketTypeHash);
            if (InventoryUtils.isBucketFull(destBucket)) {
                this.sharedApp.showWarning(inventoryItem.itemValue.displayProperties.name + " transfer failed: Destination is full!", { timeOut: 5000 });
                return resolve();
            }

            this.inventoryItemService.transferItemToIndex(inventoryItem, destCharacterIndex)
                .then((transferResult: Array<Array<InventoryItemTransferResult>>) => {
                    let transferSuccesses = transferResult[0];
                    let transferFailures = transferResult[1];

                    // Mark this bucket for refresh if needed
                    transferSuccesses.forEach((transferResult) => {
                        if (transferResult.refreshRequired)
                            this.refreshIndexes[inventoryItem.characterIndex] = true;
                    });

                    transferFailures.forEach((transferFailure) => {
                        this.sharedApp.showWarning(transferFailure.inventoryItem.itemValue.displayProperties.name + " transfer failed: " + transferFailure.Message,
                            { timeOut: 5000 });
                        console.warn(transferFailure);
                    });
                    resolve();
                }).catch((error) => {
                    this.sharedApp.showError("Error when trying to transfer " + inventoryItem.itemValue.displayProperties.name, error);
                    reject(error);
                });
        }).then((data) => {
            this.sharedApp.hideLoading(loadingId);
            return data;
        }).catch((error) => {
            this.sharedApp.showError("There was an error when trying to transfer " + inventoryItem.itemValue.displayProperties.name, error);
            this.sharedApp.hideLoading(loadingId);
        });
    }

    equipSingleItemToIndex(inventoryItem: InventoryItem, destCharacterIndex: number): Promise<any> {
        let destCharacter = this.accountSummary.characterData[destCharacterIndex];

        // See if the item can actually be equipped on the character before transferring
        if (!InventoryUtils.isItemEquippableOnCharacter(inventoryItem, destCharacter)) {
            this.sharedApp.showError(inventoryItem.itemValue.displayProperties.name + " cannot be equiped on a " + destCharacter.classValue.displayProperties.name);
            return Promise.resolve();
        }

        // Transfer, then equip it
        let loadingId = -96548;
        this.sharedApp.showLoading(loadingId);
        return new Promise<any>((resolve, reject) => {
            this.inventoryItemService.setData(this.bucketsMap, this.selectedMembership, this.accountSummary);

            // Transfer item if it's not on the same character
            if (inventoryItem.characterIndex != destCharacterIndex) {
                this.transferSingleItemToIndex(inventoryItem, destCharacterIndex).then(() => {
                    setTimeout(() => {
                        this.inventoryItemService.equipItem(inventoryItem);
                        resolve();
                    }, InventoryItemService.TRANSFER_DELAY)
                }).catch((error) => {
                    reject(error);
                });
            }
            else {
                this.inventoryItemService.equipItem(inventoryItem);
                resolve();
            }
        }).then((data) => {
            this.sharedApp.hideLoading(loadingId);
            return data;
        });
    }
}
