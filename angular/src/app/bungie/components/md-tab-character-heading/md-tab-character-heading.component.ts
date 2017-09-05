import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CharacterBase } from '../../services/interface.barrel';

@Component({
  selector: 'dd-md-tab-character-heading',
  templateUrl: './md-tab-character-heading.component.html',
  styleUrls: ['./md-tab-character-heading.component.scss']
})
export class MdTabCharacterHeadingComponent {
  @Input()
  public character: CharacterBase;

  // This component can also be used to show a placeholder md-tab, which is not a Character
  @Input()
  nonCharacterTitle: string;
  @Input()
  nonCharacterSubtitle: string;
  @Input()
  nonCharacterIconPath: string;

  constructor(public domSanitizer: DomSanitizer) { }

}