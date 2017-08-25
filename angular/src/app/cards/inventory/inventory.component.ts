import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MdDialog } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { ManifestService } from 'app/bungie/manifest/manifest.service';
import { SharedBungie } from 'app/bungie/shared-bungie.service';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { FiltersDialog } from './filters-dialog/filters-dialog.component';

import { ISubNavItem, IToolbarItem } from 'app/nav/nav.interface';
import { AccountSummaryService, CharacterInventorySummaryService, InventoryItemService, VaultSummaryService } from 'app/bungie/services/service.barrel';
import { DestinyMembership, InventoryBucket, InventoryItem, IAccountSummary, IVaultSummary, SummaryCharacter, InventoryItemTransferResult } from 'app/bungie/services/interface.barrel';

import { expandInShrinkOut, fadeInFromTop } from 'app/shared/animations';
import { InventoryUtils } from './inventory-utils';
import { delayBy } from 'app/shared/decorators';

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

    // Tower definition from the manifest so we can have the icon
    towerDefinition: any;

    // Keep track if a user has collapsed a section
    expandedSections: Array<boolean>;

    // If user has long pressed an inventory item, we are in edit mode
    editMode: boolean = false;

    // Array of selected inventory items
    selectedInventoryItems: Array<InventoryItem>;

    // Filtering
    searchText: string = '';
    showInventoryGroups: Array<boolean>;

    constructor(private accountSummaryService: AccountSummaryService, private activatedRoute: ActivatedRoute, private characterInventorySummaryService: CharacterInventorySummaryService,
        public domSanitizer: DomSanitizer, private inventoryItemService: InventoryItemService, private mdDialog: MdDialog, private manifestService: ManifestService,
        private sharedBungie: SharedBungie, public sharedApp: SharedApp, private vaultSummaryService: VaultSummaryService) {
        super(sharedApp);
    }

    ngOnInit() {
        super.ngOnInit();

        // Get localStorage letiables
        this.expandedSections = this.isFullscreen ? this.getCardLocalStorageAsJsonObject("expandedSections", [false, false, false, false]) : [false, false, false, false];
        this.showInventoryGroups = this.getCardLocalStorageAsJsonObject("showInventoryGroups", [false, true, true, false, true, true, true, false, false, true]);

        // Get tower definition so we can show the tower emblem
        this.towerDefinition = this.manifestService.getManifestEntry("DestinyActivityDefinition", 1522220810);

        // Set our membership (XBL, PSN, Blizzard)
        this.selectedMembership = this.sharedBungie.destinyMemberships[this.sharedApp.userPreferences.membershipIndex];

        this.getFullInventory();

        if (this.isFullscreen) {
            this.setSubNavItems();
            this.sharedApp.showInfoOnce("Press and hold an item to enter edit mode.");
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

    refreshVaultInventory(characterIndex: number) {
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

    searchTextChanged(newSearchText: string) {
        let charAddedToEnd: boolean = false;
        if (newSearchText.length - 1 == this.searchText.length && newSearchText.startsWith(this.searchText))
            charAddedToEnd = true;

        this.searchText = newSearchText;
        this.applyFilter(charAddedToEnd);
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
        // If we're in card mode, treat expandable sections as accordions
        if (!this.isFullscreen)
            for (let i = 0; i < this.expandedSections.length; i++) {
                if (i == sectionIndex) continue;
                this.expandedSections[i] = false;
            }

        this.expandedSections[sectionIndex] = !this.expandedSections[sectionIndex];
        if (this.isFullscreen)
            this.setCardLocalStorage("expandedSections", JSON.stringify(this.expandedSections));
    }

    inventoryItemLongPress(inventoryItem: InventoryItem) {
        if (inventoryItem.itemValue.nonTransferrable) {
            this.sharedApp.showWarning("This item is not transferrable.", { timeOut: 1500, progressBar: false });
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
            this.sharedApp.showWarning("This item is not transferrable.", { timeOut: 1500, progressBar: false });
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

    transferItemsToIndex(inventoryItems: Array<InventoryItem>, destCharacterIndex: number, tryAgain: boolean = true) {
        this.inventoryItemService.transferItems(this.bucketsMap, this.selectedMembership, this.accountSummary, inventoryItems, destCharacterIndex, 1)
            .then((transferResult: Array<Array<InventoryItemTransferResult>>) => {
                let transferSuccesses = transferResult[0];
                let transferFailures = transferResult[1];

                let shouldRefreshDestCharacter: boolean = false;
                // Process transfer successes
                transferSuccesses.forEach((transferResult: InventoryItemTransferResult) => {
                    let destinationBucketNotExists = this.transferItemUpdateUI(transferResult.inventoryItem, transferResult.destCharacterIndex);
                    if (!shouldRefreshDestCharacter && destinationBucketNotExists == true)
                        shouldRefreshDestCharacter = true;
                });

                if (transferFailures.length > 0) {
                    if (tryAgain) {
                        // If we have failed to transfer something, refresh all buckets and try again.
                        let inventoryPromises = new Array<Promise<any>>();
                        for (let i = 0; i < this.accountSummary.characters.length; i++)
                            inventoryPromises.push(this.loadCharacterInventory(i));

                        inventoryPromises.push(this.loadVaultInventory());

                        Promise.all(inventoryItems).then(() => {
                            let failedInventoryItems = new Array<InventoryItem>();
                            transferFailures.forEach((transferFailure) => { failedInventoryItems.push(transferFailure.inventoryItem) });
                            this.transferItemsToIndex(failedInventoryItems, destCharacterIndex, false);
                        }).catch((error) => {
                            this.sharedApp.showError("There was an unexpected error refreshing the inventory after transfer!", error);
                            this.setEditMode(false);
                        });
                    }
                    else {
                        // If we have already tried again, tell user something went wrong
                        transferFailures.forEach((transferFailure) => {
                            this.sharedApp.showWarning(transferFailure.inventoryItem.itemValue.itemName + "Transfer Failed! " + transferFailure.Message,
                                { timeOut: 5000, progressBar: false });
                        });
                        this.setEditMode(false);
                    }
                }
                else {
                    if (shouldRefreshDestCharacter) {
                        let refreshPromise = destCharacterIndex == 3 ? this.loadVaultInventory() : this.loadCharacterInventory(destCharacterIndex);
                        refreshPromise.then(() => {
                            InventoryUtils.applyFilterToBucketGroups(this.searchText, this.showInventoryGroups, this.bucketGroupsArray[destCharacterIndex], false);
                        });
                    }
                    else
                        // Otherwise, just filter the destination bucket group
                        InventoryUtils.applyFilterToBucketGroups(this.searchText, this.showInventoryGroups, this.bucketGroupsArray[destCharacterIndex], false);

                    this.setEditMode(false);
                }
            }).catch((error) => {
                this.sharedApp.showError("There was an unexpected error transferring items!", error);
                this.setEditMode(false);
            });
    }

    private transferItemUpdateUI(inventoryItem: InventoryItem, destCharacterIndex: number) {
        // Insert the item in to the destinationArray
        let srcBucket: InventoryBucket = this.bucketsMap[inventoryItem.characterIndex].get(inventoryItem.itemValue.bucketTypeHash);
        let sourceBucketItems: Array<InventoryItem> = srcBucket.items;

        // Remove this item from the sourceArray
        sourceBucketItems.splice(sourceBucketItems.indexOf(inventoryItem), 1);

        let destBucket: InventoryBucket = this.bucketsMap[destCharacterIndex].get(inventoryItem.itemValue.bucketTypeHash);
        // If this bucket doesn't exist yet, let the callee know so we can refresh the inventory from network request
        if (destBucket == null)
            return true;

        // Update inventory item with new characterIndex
        inventoryItem.characterIndex = destCharacterIndex;

        destBucket.items.push(inventoryItem);

        // Sort after we insert the new item
        InventoryUtils.sortBucketItems(destBucket);

        return false;
    }
}
