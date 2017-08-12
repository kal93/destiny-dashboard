import { Injectable } from '@angular/core';

import { CharacterInventorySummaryService, VaultSummaryService } from 'app/bungie/services/service.barrel';
import { DestinyMembership, IAccountSummary, SummaryCharacter } from 'app/bungie/services/interface.barrel';

@Injectable()
export class inventoryService {

    constructor(private characterInventorySummaryService: CharacterInventorySummaryService, private vaultSummaryService: VaultSummaryService) { }

    getFullInventory(selectedMembership: DestinyMembership, accountSummary: IAccountSummary): Promise<any> {
        // Set an array of promises so we can use Promise.All later
        var inventoryDataPromises = new Array<Promise<any>>();

        // Add the vault request to the promises we're about to fire 
        inventoryDataPromises.push(this.getVaultInventory(selectedMembership));

        // Now add character promises
        accountSummary.characters.forEach((character: SummaryCharacter) => {
            inventoryDataPromises.push(this.getCharacterInventory(selectedMembership, character.characterBase.characterId));
        });

        return Promise.all(inventoryDataPromises);
    }

    getVaultInventory(selectedMembership: DestinyMembership): Promise<any> {
        return this.vaultSummaryService.getVaultSummary(selectedMembership);
    }

    clearVaultInventoryCache(selectedMembership: DestinyMembership) {
        this.vaultSummaryService.clearVaultSummaryCache(selectedMembership);
    }

    getCharacterInventory(selectedMembership: DestinyMembership, characterId: string): Promise<any> {
        return this.characterInventorySummaryService.getCharacterInventorySummary(selectedMembership, characterId)
    }

    clearCharacterInventoryCache(selectedMembership: DestinyMembership, characterId: string) {
        this.characterInventorySummaryService.clearCharacterInventorySummaryCache(selectedMembership, characterId);
    }
}