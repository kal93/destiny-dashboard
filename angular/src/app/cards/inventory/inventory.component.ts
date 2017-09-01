import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MdDialog } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { SharedBungie } from 'app/bungie/shared-bungie.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { FiltersDialog } from './filters-dialog/filters-dialog.component';
import { TransferQuantityDialog } from './transfer-quantity-dialog/transfer-quantity-dialog.component';
import { InventoryUtils } from 'app/bungie/services/destiny/inventory/inventory-utils';

import { ISubNavItem } from 'app/nav/nav.interface';
import { AccountSummaryService, CharacterInventorySummaryService, InventoryItemService, VaultSummaryService } from 'app/bungie/services/service.barrel';
import { DestinyMembership, InventoryBucket, InventoryItem, IAccountSummary, IVaultSummary, SummaryCharacter, InventoryItemTransferResult } from 'app/bungie/services/interface.barrel';

import { expandInShrinkOut, fadeInFromTop } from 'app/shared/animations';
import { delayBy } from 'app/shared/decorators';

import 'rxjs/add/operator/debounceTime';

@Component({
    selector: 'dd-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: ['../_base/card.component.scss', './inventory.component.scss'],
    animations: [expandInShrinkOut(), fadeInFromTop()]
})

export class ItemManagerComponent extends CardComponent {
    CARD_DEFINITION_ID = 6;

    isInitialized: boolean = false;

    // Get the selected membership (Xbox, PSN, Blizzard)
    private selectedMembership: DestinyMembership;

    // Account summary so we can get the characters associated to this account
    accountSummary: IAccountSummary;

    // Array of Map of <bucketHash, bucket>. Array position matches caracter position in this.accountSummary.characters. Vault is always [3]
    private bucketsMap: Array<Map<number, InventoryBucket>> = new Array<Map<number, InventoryBucket>>(4);

    // Array of character buckets for display in .html. Array position matches caracter position in this.accountSummary.characters. Character[Buckets]
    bucketsArray: Array<Array<InventoryBucket>> = new Array<Array<InventoryBucket>>(4);

    // Only character buckets get grouped. Character[BucketGroup[Buckets]]
    bucketGroupsArray: Array<Array<Array<InventoryBucket>>> = new Array<Array<Array<InventoryBucket>>>(4);

    // Keep track if a user has collapsed a section
    expandedSections: Array<boolean>;

    // If user has long pressed an inventory item, we are in edit mode
    editMode: boolean = false;

    // Array of selected inventory items
    selectedInventoryItems: Array<InventoryItem>;
    private refreshIndexes: Array<boolean> = [false, false, false, false];

    // Filtering
    searchText: string = '';
    searchTextForm = new FormControl();
    showInventoryGroups: Array<boolean>;

    constructor(private accountSummaryService: AccountSummaryService, private characterInventorySummaryService: CharacterInventorySummaryService,
        public domSanitizer: DomSanitizer, private inventoryItemService: InventoryItemService, private mdDialog: MdDialog, public manifestService: ManifestService,
        private sharedBungie: SharedBungie, public sharedApp: SharedApp, private vaultSummaryService: VaultSummaryService) {
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

        this.getFullInventory();
        this.initSearch();

        if (this.isFullscreen) {
            this.setSubNavItems();
            this.sharedApp.showInfoOnce("Press and hold an item to enter multi-transfer mode.");
        }
    }

    getFullInventory() {
        // Get Account Summary to get the list of available characters
        this.accountSummaryService.getAccountSummary(this.selectedMembership).then((accountSummary: IAccountSummary) => {
            this.accountSummary = accountSummary;
            this.accountSummary.characters.forEach((character: SummaryCharacter) => {
                // Set the manifest values for the characters
                character.characterBase.classValue = this.manifestService.getManifestEntry("DestinyClassDefinition", character.characterBase.classHash);
                character.characterBase.genderValue = this.manifestService.getManifestEntry("DestinyGenderDefinition", character.characterBase.genderHash);
                character.characterBase.raceValue = this.manifestService.getManifestEntry("DestinyRaceDefinition", character.characterBase.raceHash);
            });

            // Init buckets
            this.bucketGroupsArray = new Array<Array<Array<InventoryBucket>>>(4);
            this.bucketsMap = new Array<Map<number, InventoryBucket>>(4);

            // Load character data
            let inventoryPromises = new Array<Promise<any>>();
            for (let i = 0; i < this.accountSummary.characters.length; i++)
                inventoryPromises.push(this.loadCharacterInventory(i));

            inventoryPromises.push(this.loadVaultInventory());

            Promise.all(inventoryPromises).then(() => {
                this.applyFilter();
                this.isInitialized = true;
            });

        }).catch(error => {
            this.sharedApp.showError("There was an error getting the account summary.", error);
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
        let character: SummaryCharacter = this.accountSummary.characters[characterIndex];
        return this.characterInventorySummaryService.getCharacterInventorySummary(this.selectedMembership, character.characterBase.characterId).then((inventoryResponse) => {
            this.populateBuckets(characterIndex, inventoryResponse.items);
        });
    }

    loadVaultInventory(): Promise<any> {
        return this.vaultSummaryService.getVaultSummary(this.selectedMembership).then((vaultSummaryResponse: IVaultSummary) => {
            this.populateBuckets(3, vaultSummaryResponse.items);
        });
    }

    populateBuckets(bucketIndex: number, responseItems: Array<InventoryItem>) {
        this.bucketsMap[bucketIndex] = new Map<number, InventoryBucket>();
        this.bucketsArray[bucketIndex] = new Array<InventoryBucket>();
        InventoryUtils.populateBucketMapFromResponse(bucketIndex, this.manifestService, responseItems, this.bucketsMap[bucketIndex]);
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
        for (let characterIndex = 0; characterIndex < this.accountSummary.characters.length; characterIndex++) {
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
        if (inventoryItem.itemValue.nonTransferrable) {
            this.sharedApp.showWarning("This item is not transferrable", { timeOut: 1500, progressBar: false });
            return;
        }

        if (!this.editMode)
            this.setEditMode(true);

        this.inventoryItemClicked(inventoryItem);
    }

    inventoryItemClicked(inventoryItem: InventoryItem) {
        if (!this.editMode)
            return;

        if (inventoryItem.itemValue.nonTransferrable) {
            this.sharedApp.showWarning("This item is not transferrable", { timeOut: 1500, progressBar: false });
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

    @delayBy(50)
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
            title: 'Manage Loadouts', materialIcon: 'library_add',
            selectedCallback: (subNavItem: ISubNavItem) => {
            }
        });

        // Show list of loadouts
    }

    transferItemsToIndex(inventoryItems: Array<InventoryItem>, destCharacterIndex: number) {
        let showTransferQuantityDialog: boolean = false;
        for (var i = 0; i < inventoryItems.length; i++) {
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
        return new Promise<any>((resolve, reject) => {
            // Don't transfer items with no quantity
            if (inventoryItem.transferQuantity === 0)
                return resolve();

            // Don't attempt to transfer if destination bucket is full            
            let destBucket: InventoryBucket = this.bucketsMap[destCharacterIndex].get(inventoryItem.itemValue.bucketTypeHash);
            if (InventoryUtils.isBucketFull(destBucket)) {
                this.sharedApp.showWarning(inventoryItem.itemValue.itemName + " transfer failed: Destination is full!",
                    { timeOut: 5000, progressBar: false });
                return resolve();
            }

            this.inventoryItemService.transferItemToIndex(this.bucketsMap, this.selectedMembership, this.accountSummary, inventoryItem, destCharacterIndex)
                .then((transferResult: Array<Array<InventoryItemTransferResult>>) => {
                    let transferSuccesses = transferResult[0];
                    let transferFailures = transferResult[1];

                    // Mark this bucket for refresh if needed
                    transferSuccesses.forEach((transferResult) => {
                        if (transferResult.refreshRequired)
                            this.refreshIndexes[inventoryItem.characterIndex] = true;
                    });

                    transferFailures.forEach((transferFailure) => {
                        this.sharedApp.showWarning(transferFailure.inventoryItem.itemValue.itemName + " transfer failed: " + transferFailure.Message,
                            { timeOut: 5000, progressBar: false });
                    });
                    resolve();
                }).catch((error) => {
                    this.sharedApp.showError("There was an unexpected error transferring items!", error);
                    reject(error);
                });
        });
    }
}
