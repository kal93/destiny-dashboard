import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MdDialog } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { inventoryService } from './inventory.service';
import { ManifestService } from '../../bungie/manifest/manifest.service';
import { SharedBungie } from '../../bungie/shared-bungie.service';
import { SharedApp } from '../../shared/services/shared-app.service';
import { FiltersDialog } from './filters-dialog/filters-dialog.component';

import { ISubNavItem, IToolbarItem } from '../../nav/nav.interface';
import { AccountSummaryService } from 'app/bungie/services/service.barrel';
import { DestinyMembership, InventoryBucket, InventoryItem, IAccountSummary, IVaultSummary, SummaryCharacter } from 'app/bungie/services/interface.barrel';

import { expandInShrinkOut } from '../../shared/animations';
import { debounceBy, delayBy } from '../../shared/decorators';
import { InventoryUtils } from './inventory-utils';

@Component({
    selector: 'dd-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: ['../_base/card.component.scss', './inventory.component.scss'],
    animations: [expandInShrinkOut()],
    providers: [inventoryService]
})

export class ItemManagerComponent extends CardComponent {
    CARD_DEFINITION_ID = 6;

    // Get the selected membership (Xbox, PSN, Blizzard)
    private selectedMembership: DestinyMembership;

    // Account summary so we can get the characters associated to this account
    accountSummary: IAccountSummary;

    // Map of vault bucket data <bucketHash, bucket>
    private vaultBucketsMap: Map<number, InventoryBucket>;

    // Array of vault buckets for display in .html
    vaultBucketsArray: Array<InventoryBucket> = new Array<InventoryBucket>();

    // Array of Map of <bucketHash, bucket>. Array position matches caracter position in this.accountSummary.characters
    private charactersBucketsMap: Array<Map<number, InventoryBucket>>;

    // Array of character buckets for display in .html. Array position matches caracter position in this.accountSummary.characters. Character[Buckets]
    charactersBucketsArray: Array<Array<InventoryBucket>> = new Array<Array<InventoryBucket>>();

    // Inception level 4. Character[BucketGroup[Buckets]]
    charactersBucketsGroupsArray: Array<Array<Array<InventoryBucket>>>;

    // Tower definition from the manifest so we can have the icon
    towerDefinition: any;

    // Keep track if a user has collapsed a section
    collapsedSections: Array<boolean>;

    // If user has long pressed an inventory item, we are in edit mode
    editMode: boolean = false;

    selectedInventoryItems: Array<InventoryItem>;

    // Filtering
    searchText: string = '';
    showInventoryGroups: Array<boolean> = new Array<boolean>(9);

    constructor(private accountSummaryService: AccountSummaryService, private activatedRoute: ActivatedRoute, public domSanitizer: DomSanitizer,
        private inventoryService: inventoryService, private mdDialog: MdDialog, private manifestService: ManifestService,
        private sharedBungie: SharedBungie, public sharedApp: SharedApp) {
        super(sharedApp);
    }

    ngOnInit() {
        super.ngOnInit();

        // Set collapsed sections
        this.collapsedSections = this.getCardLocalStorageAsJsonObject("collapsedSections", [false, false, false, false]);

        // Get tower definition so we can show the tower emblem
        this.towerDefinition = this.manifestService.getManifestEntry("DestinyActivityDefinition", 1522220810);

        // Set our membership (XBL, PSN, Blizzard)
        this.selectedMembership = this.sharedBungie.destinyMemberships[this.sharedApp.userPreferences.membershipIndex];

        if (this.isFullscreen)
            this.setSubNavItems();

        this.getFullInventory();

        this.sharedApp.showInfoOnce("Press and hold an item to enter edit mode.");
    }

    private getFullInventory() {
        // Get Account Summary to get the list of available characters
        this.accountSummaryService.getAccountSummary(this.selectedMembership).then((accountSummary: IAccountSummary) => {
            this.accountSummary = accountSummary;
            this.accountSummary.characters.forEach((character: SummaryCharacter) => {
                // Set the manifest values for the characters
                character.characterBase.classValue = this.manifestService.getManifestEntry("DestinyClassDefinition", character.characterBase.classHash);
                character.characterBase.genderValue = this.manifestService.getManifestEntry("DestinyGenderDefinition", character.characterBase.genderHash);
                character.characterBase.raceValue = this.manifestService.getManifestEntry("DestinyRaceDefinition", character.characterBase.raceHash);
            });

            // Fetch the inventory
            this.inventoryService.getFullInventory(this.selectedMembership, this.accountSummary).then((inventoryResponses) => {
                // Vault is the first response
                let vaultSummaryResponse: IVaultSummary = inventoryResponses.shift();

                // Populate vault buckets
                this.vaultBucketsMap = new Map<number, InventoryBucket>();
                this.vaultBucketsArray = new Array<InventoryBucket>();
                InventoryUtils.populateBucketMapFromResponse(this.manifestService, vaultSummaryResponse.items, this.vaultBucketsMap);
                InventoryUtils.flattenInventoryBuckets(this.vaultBucketsMap, this.vaultBucketsArray);

                // Init the array for the character buckets map and bucketsGroupArray. Should be the same size as the number of characters we have.
                this.charactersBucketsMap = new Array<Map<number, InventoryBucket>>(inventoryResponses.length);

                this.charactersBucketsGroupsArray = new Array<Array<Array<InventoryBucket>>>(inventoryResponses.length);
                // All remaining responses should be characters
                for (let i = 0; i < inventoryResponses.length; i++) {
                    this.charactersBucketsMap[i] = new Map<number, InventoryBucket>();
                    this.charactersBucketsArray[i] = new Array<InventoryBucket>();
                    InventoryUtils.populateBucketMapFromResponse(this.manifestService, inventoryResponses[i].items, this.charactersBucketsMap[i]);
                    InventoryUtils.flattenInventoryBuckets(this.charactersBucketsMap[i], this.charactersBucketsArray[i]);

                    // Group character buckets in to separate arrays based on their category id
                    this.groupCharactersBuckets(this.charactersBucketsArray[i], i);
                }

                this.applyFilter();
            }).catch((error) => {
                this.sharedApp.showError("There was an error getting the inventory.", error);
            });

        }).catch(error => {
            this.sharedApp.showError("There was an error getting the account summary.", error);
        });
    }

    private groupCharactersBuckets(characterBuckets: Array<InventoryBucket>, characterIndex: number) {
        // Create array for the character             [BucketGroup[Buckets]]
        this.charactersBucketsGroupsArray[characterIndex] = new Array<Array<InventoryBucket>>();
        this.charactersBucketsGroupsArray[characterIndex][0] = new Array<InventoryBucket>();

        let groupIndex: number = 0;
        for (let j = 0; j < characterBuckets.length; j++) {
            let characterBucket = characterBuckets[j];

            //If we're changing to a specific bucket type, let's break it in to a new group
            let bucketName = characterBuckets[j].bucketValue.bucketName;
            if (bucketName == "Helmet" || bucketName == "Vehicle" || bucketName == "Shaders" || bucketName == "Materials" || bucketName == "Mission") {
                groupIndex++;
                this.charactersBucketsGroupsArray[characterIndex][groupIndex] = new Array<InventoryBucket>();
            }

            this.charactersBucketsGroupsArray[characterIndex][groupIndex].push(characterBucket);
        }
    }

    refreshCharacter(characterIndex: number) {
        let character: SummaryCharacter = this.accountSummary.characters[characterIndex];

        this.inventoryService.clearCharacterInventoryCache(this.selectedMembership, character.characterBase.characterId);
        this.inventoryService.getCharacterInventory(this.selectedMembership, character.characterBase.characterId).then((inventoryResponse) => {
            this.charactersBucketsMap[characterIndex] = new Map<number, InventoryBucket>();
            this.charactersBucketsArray[characterIndex] = new Array<InventoryBucket>();
            InventoryUtils.populateBucketMapFromResponse(this.manifestService, inventoryResponse.items, this.charactersBucketsMap[characterIndex]);
            InventoryUtils.flattenInventoryBuckets(this.charactersBucketsMap[characterIndex], this.charactersBucketsArray[characterIndex]);
            this.groupCharactersBuckets(this.charactersBucketsArray[characterIndex], characterIndex);
            this.applyFilter();
        });
    }

    refreshVault() {
        this.inventoryService.clearVaultInventoryCache(this.selectedMembership);
        this.inventoryService.getVaultInventory(this.selectedMembership).then((vaultSummaryResponse: IVaultSummary) => {
            // Populate vault buckets
            this.vaultBucketsMap = new Map<number, InventoryBucket>();
            this.vaultBucketsArray = new Array<InventoryBucket>();
            InventoryUtils.populateBucketMapFromResponse(this.manifestService, vaultSummaryResponse.items, this.vaultBucketsMap);
            InventoryUtils.flattenInventoryBuckets(this.vaultBucketsMap, this.vaultBucketsArray);
            this.applyFilter();
        });
    }

    searchTextChanged(newSearchText: string) {
        let characterAddedToEnd: boolean = false;
        if (newSearchText.length - 1 == this.searchText.length && newSearchText.startsWith(this.searchText))
            characterAddedToEnd = true;

        this.searchText = newSearchText;
        this.applyFilter(characterAddedToEnd);
    }

    @debounceBy(400)
    applyFilter(skipAlreadyFiltered: boolean = false) {
        // Apply filter to vault bucket
        for (let i = 0; i < this.vaultBucketsArray.length; i++)
            this.applyFilterToBucket(this.vaultBucketsArray[i], skipAlreadyFiltered);

        // Apply filter to each characters bucket groups
        for (let characterIndex = 0; characterIndex < this.charactersBucketsGroupsArray.length; characterIndex++) {
            // Bucket groups for character
            let bucketGroups = this.charactersBucketsGroupsArray[characterIndex];

            for (let groupIndex = 0; groupIndex < bucketGroups.length; groupIndex++) {
                let buckets = this.charactersBucketsGroupsArray[characterIndex][groupIndex];

                for (let i = 0; i < buckets.length; i++)
                    this.applyFilterToBucket(buckets[i], skipAlreadyFiltered);
            }
        }
    }

    /**
     * @param {boolean} skipAlreadyFiltered - Do not check items that have been filtered out since they'll definitely be filtered out again
     */
    applyFilterToBucket(bucket: InventoryBucket, skipAlreadyFiltered: boolean) {
        var bucketName: string = bucket.bucketValue.bucketName;
        if ((!this.showInventoryGroups[0] && bucketName == "Bounties") || (!this.showInventoryGroups[1] && bucketName == "Emblems") ||
            (!this.showInventoryGroups[2] && bucketName == "Emotes") || (!this.showInventoryGroups[3] && bucketName == "Mission") ||
            (!this.showInventoryGroups[4] && bucketName == "Ornaments") || (!this.showInventoryGroups[5] && bucketName == "Shaders") ||
            (!this.showInventoryGroups[6] && bucketName == "Ships") || (!this.showInventoryGroups[7] && bucketName == "Sparrow Horn") ||
            (!this.showInventoryGroups[8] && bucketName == "Quests") || (!this.showInventoryGroups[9] && bucketName == "Vehicle")) {
            bucket.filteredOut = true;
            return;
        }

        let searchTextLower = this.searchText.toLowerCase().trim();
        let bucketHasItem = false;
        for (let i = 0; i < bucket.items.length; i++) {
            let inventoryItem = bucket.items[i];
            if (inventoryItem.filteredOut && skipAlreadyFiltered)
                continue;

            inventoryItem.filteredOut = false;
            if (inventoryItem.itemValue.itemName.toLowerCase().indexOf(searchTextLower) == -1)
                inventoryItem.filteredOut = true;
            else
                bucketHasItem = true;
        }
        bucket.filteredOut = !bucketHasItem;
    }

    collapseSection(sectionIndex: number) {
        this.collapsedSections[sectionIndex] = !this.collapsedSections[sectionIndex];
        this.setCardLocalStorage("collapsedSections", JSON.stringify(this.collapsedSections));
    }

    inventoryItemLongPress(inventoryItem: InventoryItem) {
        if (!this.editMode)
            this.setEditMode(true);

        this.inventoryItemClicked(inventoryItem);
    }

    inventoryItemClicked(inventoryItem: InventoryItem) {
        if (this.editMode) {
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
    }

    setEditMode(editOn: boolean) {
        this.editMode = editOn;
        this.setToolbarItems();
        if (this.editMode) {
            this.sharedApp.pageTitle = "";
            this.selectedInventoryItems = new Array<InventoryItem>();
        }
        else
            this.sharedApp.pageTitle = this.activatedRoute.root.firstChild.snapshot.data['title'];
    }

    @delayBy(100)
    setSubNavItems() {
        this.sharedApp.subNavItems = new Array<ISubNavItem>();

        this.sharedApp.subNavItems.push({
            title: 'Manage Loadouts', materialIcon: 'library_add',
            selectedCallback: (subNavItem: ISubNavItem) => {
            }
        });

        this.sharedApp.subNavItems.push({ title: '_spacer', materialIcon: '' });

        this.sharedApp.subNavItems.push({
            title: 'Filters', materialIcon: 'filter_list',
            selectedCallback: (subNavItem: ISubNavItem) => {
                let dialogRef = this.mdDialog.open(FiltersDialog);
                dialogRef.componentInstance.showInventoryGroups = this.showInventoryGroups;
                dialogRef.afterClosed().subscribe((result: string) => { this.applyFilter(); });
            }
        });

        // Show list of loadouts

    }

    setToolbarItems() {
        this.sharedApp.toolbarItems = new Array<IToolbarItem>();

        //If we're not in edit mode, do not set toolbar items
        if (!this.editMode)
            return;

        // Move toolbar item
        this.sharedApp.toolbarItems.push({
            title: "Move", materialIcon: "forward",
            selectedCallback: (subNavItem: IToolbarItem) => {
            }
        });

        this.sharedApp.toolbarItems.push({
            title: "Equip", materialIcon: "swap_vert",
            selectedCallback: (subNavItem: IToolbarItem) => {
            }
        });

        // Cancel toolbar item
        this.sharedApp.toolbarItems.push({
            title: "Done", materialIcon: "done",
            selectedCallback: (subNavItem: IToolbarItem) => {
                this.setEditMode(false);

                // Deselect all inventory items
                this.selectedInventoryItems.forEach((selectedInventoryItem: InventoryItem) => {
                    selectedInventoryItem.selected = false;
                });

                // Reset selected inventory items
                this.selectedInventoryItems = new Array<InventoryItem>();

                // Reset toolbars items
                this.sharedApp.toolbarItems = new Array<IToolbarItem>();
            }
        });
    }
}
