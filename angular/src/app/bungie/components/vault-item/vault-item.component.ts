import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CharacterInventoryItem, VaultItem } from '../../services/interface.barrel';

@Component({
  selector: 'dd-vault-item',
  templateUrl: './vault-item.component.html',
  styleUrls: ['./vault-item.component.scss']
})
export class VaultItemComponent {
  @Input()
  public vaultItem: VaultItem;

  constructor(public domSanitizer: DomSanitizer) { }

}