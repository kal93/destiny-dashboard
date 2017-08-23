import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MdOptionSelectionChange } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { SharedBungie } from 'app/bungie/shared-bungie.service';

import { fadeInChildren, fadeInOut } from 'app/shared/animations';
import { DestinyMembership, DestinyMembershipType } from 'app/bungie/services/interface.barrel';

import 'rxjs/add/operator/startWith';

@Component({
  selector: 'dd-gamertag-autocomplete',
  templateUrl: './gamertag-autocomplete.component.html',
  styleUrls: ['./gamertag-autocomplete.component.scss'],
  animations: [fadeInChildren(), fadeInOut()],
})
export class GamertagAutocompleteComponent {
  @Input()
  public autocompleteId: string;
  private localStorageId: string;

  @Output()
  public membershipSelected = new EventEmitter<DestinyMembership>();

  @Output()
  public initialMembership = new EventEmitter<DestinyMembership>();

  public formControl: FormControl = new FormControl();

  // All gamertags that have been selected before
  private historicMemberships: Array<DestinyMembership>;

  // Gamertags that match the autocomplete
  public filteredMemberships: Array<DestinyMembership>;

  // The last selected DestinyMembership. Used to emit to parent component on init so the parent component knows the initial value in the text box
  public selectedMembership: DestinyMembership;

  // Actual text in the input
  public selectedText: string = "";

  //If there are multiple platforms for a given gamertag
  public possibleMemberships = new Array<DestinyMembership>();

  //Hack to prevent searching when hitting enter while selecting a drop down item
  private ignoreNextSearch: boolean = false;

  constructor(public domSanitizer: DomSanitizer, protected sharedApp: SharedApp, private sharedBungie: SharedBungie) { }

  ngOnInit() {
    this.localStorageId = "autocomplete-" + this.autocompleteId;

    // Load historic gamertags the user has entered
    this.historicMemberships = this.sharedApp.getLocalStorageAsJsonObject(this.localStorageId + "-historicMemberships", new Array<DestinyMembership>());

    // Load last selected membership id
    this.selectedMembership = this.sharedApp.getLocalStorageAsJsonObject(this.localStorageId + "-selectedMembership", null);

    if (this.selectedMembership != null) {
      this.selectedText = this.selectedMembership.displayName;
      this.initialMembership.emit(this.selectedMembership);
    }
    else {
      //Try to set the selected membership to the currently logged in user
      try {
        this.selectedMembership = this.sharedBungie.destinyMemberships[this.sharedApp.userPreferences.membershipIndex];
        this.selectedText = this.selectedMembership.displayName;
        this.initialMembership.emit(this.selectedMembership);
      }
      catch (e) {
        //No selected user, not logged in, show Demo account        
        this.selectedText = "DeeJ BNG";
        this.initialMembership.emit({ displayName: "DeeJ BNG", iconPath: "/img/theme/destiny/icons/icon_psn.png", membershipId: "4611686018428791191", membershipType: 2 });
      }
    }

    // Observe input changes
    this.formControl.valueChanges
      .startWith(this.selectedText) //Initizlize observable
      .subscribe(selectedText => this.applyFilter(selectedText));
  }

  applyFilter(selectedText: string) {
    this.selectedText = selectedText;

    if (selectedText == null || selectedText.length == 0)
      this.filteredMemberships = this.historicMemberships;
    else
      this.filteredMemberships = this.historicMemberships.filter((membership) => {
        let filteredLower = membership.displayName.toLowerCase();
        let selectedLower = selectedText.toLowerCase();
        return filteredLower != selectedLower && filteredLower.indexOf(selectedLower) > -1;
      });
  }

  search() {
    if (this.ignoreNextSearch) {
      this.ignoreNextSearch = false;
      return;
    }

    if (this.selectedText.length < 3) {
      this.sharedApp.showWarning("Please enter a valid gamertag.");
      return;
    }

    //Search all platforms, wait for response, let user choose which one they want if there is multiple
    Promise.all([
      this.sharedBungie.searchDestinyPlayer(DestinyMembershipType.TIGERXBOX, this.selectedText),
      this.sharedBungie.searchDestinyPlayer(DestinyMembershipType.TIGERPSN, this.selectedText),
      this.sharedBungie.searchDestinyPlayer(DestinyMembershipType.TIGERBLIZZARD, this.selectedText)
    ]).then((responses) => {
      let xboxResponse = responses[0];
      let psnResponse = responses[1];
      let blizzardResponse = responses[2];

      if (xboxResponse != null) this.possibleMemberships.push(xboxResponse);
      if (psnResponse != null) this.possibleMemberships.push(psnResponse);
      if (blizzardResponse != null) this.possibleMemberships.push(blizzardResponse);

      //No results found
      if (this.possibleMemberships.length == 0) {
        this.sharedApp.showWarning("Could not find " + this.selectedText);

        //Reset possible memberships
        this.possibleMemberships = new Array<DestinyMembership>();
        return;
      }

      //One result found, use it
      if (this.possibleMemberships.length == 1)
        this.selectMembership(this.possibleMemberships[0]);

      //Multiple results found, let user decide which platform to use. Letting user choose is handled in html template.

    }).catch((error) => {
      this.sharedApp.showError("There was an error when searching for the gamertag.", error);
    });
  }

  autocompleteOptionSelected(event: MdOptionSelectionChange, selectedMembership: DestinyMembership) {
    if (event.source.selected) {
      this.membershipSelected.emit(selectedMembership);
      this.sharedApp.setLocalStorage(this.localStorageId + "-selectedMembership", JSON.stringify(selectedMembership));

      //Hack to not trigger search
      this.ignoreNextSearch = true;
    }
  }

  selectMembership(selectedMembership: DestinyMembership) {
    //Reset possible memberships
    this.possibleMemberships = new Array<DestinyMembership>();

    //Make sure we haven't already saved this gamertag and platform combo
    let alreadySaved: boolean = false;
    for (let i = 0; i < this.historicMemberships.length; i++) {
      if (this.historicMemberships[i].displayName.toLowerCase() == selectedMembership.displayName.toLowerCase() &&
        this.historicMemberships[i].membershipType == selectedMembership.membershipType) {
        alreadySaved = true;
        break;
      }
    }

    if (!alreadySaved) {
      this.historicMemberships.push(selectedMembership);
      this.sharedApp.setLocalStorage(this.localStorageId + "-historicMemberships", JSON.stringify(this.historicMemberships));
      this.applyFilter(this.selectedText);
    }

    this.membershipSelected.emit(selectedMembership);
    this.sharedApp.setLocalStorage(this.localStorageId + "-selectedMembership", JSON.stringify(selectedMembership));
  }

  removeMembershipFromHistory(event: MouseEvent, removeMembership: DestinyMembership) {
    //Remove from historic
    for (let i = 0; i < this.historicMemberships.length; i++) {
      if (this.historicMemberships[i].displayName.toLowerCase() == removeMembership.displayName.toLowerCase() &&
        this.historicMemberships[i].membershipType == removeMembership.membershipType) {
        this.historicMemberships.splice(i, 1);
        break;
      }
    }
    this.sharedApp.setLocalStorage(this.localStorageId + "-historicMemberships", JSON.stringify(this.historicMemberships));

    this.applyFilter(this.selectedText);

    //Remove from storage if selected
    if (this.selectedMembership != null &&
      this.selectedMembership.displayName.toLowerCase() == removeMembership.displayName.toLowerCase() &&
      this.selectedMembership.membershipType == removeMembership.membershipType) {
      this.sharedApp.removeLocalStorage(this.localStorageId + "-selectedMembership");
      this.selectedMembership == null;
    }

    event.stopPropagation();
  }

}
