import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpRequestType, HttpService } from 'app/shared/services/http.service';
import { BungieSiteNewsService } from 'app/bungie/services/service.barrel';

import { INews } from 'app/bungie/services/interface.barrel';
import { NewsTypes } from 'app/bungie/services/enums.interface';

import { CharacterInventorySummaryService, VaultSummaryService } from 'app/bungie/services/service.barrel';
import { DestinyMembership, IAccountSummary, SummaryCharacter } from 'app/bungie/services/interface.barrel';

@Injectable()
export class inventoryService {

    constructor(private characterInventorySummaryService: CharacterInventorySummaryService, private vaultSummaryService: VaultSummaryService) { }

    getInventory(selectedMembership: DestinyMembership, accountSummary: IAccountSummary): Promise<any> {
        // Set an array of promises so we can use Promise.All later
        var inventoryDataPromises = new Array<Promise<any>>();

        // Add the vault request to the promises we're about to fire 
        inventoryDataPromises.push(this.vaultSummaryService.getVaultSummary(selectedMembership));

        // Now add character promises
        accountSummary.characters.forEach((character: SummaryCharacter) => {
            inventoryDataPromises.push(this.characterInventorySummaryService.getCharacterInventorySummary(selectedMembership, character.characterBase.characterId));
        });

        return Promise.all(inventoryDataPromises);
    }
}