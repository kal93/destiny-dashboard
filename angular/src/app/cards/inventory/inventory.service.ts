import { Injectable } from '@angular/core';

import { CharacterInventorySummaryService, VaultSummaryService } from 'app/bungie/services/service.barrel';
import { DestinyMembership, IAccountSummary, SummaryCharacter } from 'app/bungie/services/interface.barrel';

@Injectable()
export class inventoryService {

    constructor(private characterInventorySummaryService: CharacterInventorySummaryService, private vaultSummaryService: VaultSummaryService) { }

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