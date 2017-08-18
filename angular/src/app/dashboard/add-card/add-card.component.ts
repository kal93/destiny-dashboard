import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { SharedDashboard } from 'app/dashboard/shared-dashboard.service';

import { ICardDefinition, CardDefinitions } from 'app/cards/_base/card-definition';
import { ICard } from 'app/cards/_base/card.interface';

@Component({
  selector: 'dd-add-card',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss']
})
export class AddCardComponent {
  @Output()
  addCardEvent = new EventEmitter<ICard>();

  availableCards = new Array<ICardDefinition>();
  filteredCards = new Array<ICardDefinition>();

  searchText: string = '';

  carouselIndex: number = 0;
  filteredIndex: number = 0;

  constructor(public sharedApp: SharedApp, private sharedDashboard: SharedDashboard, public sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.setAvailableCards();
    this.applyFilter("");
    this.sharedApp.showInfoOnce("Swipe cards to browse");
  }

  setAvailableCards() {
    //Create map of cards the user already has for quick lookups
    let alreadyAddedCards = new Map<number, boolean>();
    this.sharedDashboard.selectedDashboard.cards.forEach(dashboardCard => {
      alreadyAddedCards.set(dashboardCard.definitionId, true);
    });

    //Remove the card if the user already has it
    this.availableCards = CardDefinitions.definitions.slice();
    for (let i = 0; i < this.availableCards.length; i++) {
      if (alreadyAddedCards.has(this.availableCards[i].id)) {
        this.availableCards.splice(i, 1);
        i--;
      }
    }
  }

  applyFilter(searchText: string) {

    //Sort available cards
    this.filteredCards = this.availableCards.slice().sort((a, b) => {
      let nameA = a.title.toLowerCase(), nameB = b.title.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

    //Reset index
    this.carouselIndex = this.filteredIndex = 0;

    //Apply text filter
    this.searchText = searchText.trim();
    if (searchText.length == 0)
      return;

    let searchTextLower = this.searchText.toLowerCase();
    for (let i = 0; i < this.filteredCards.length; i++) {
      if (this.filteredCards[i].title.toLowerCase().indexOf(searchTextLower) == -1 &&
        this.filteredCards[i].description.toLowerCase().indexOf(searchTextLower) == -1)
        this.filteredCards.splice(i--, 1);
    }
  }

  cardClicked(newFilteredIndex: number) {
    //Calculate the index of filtered array for the newly selected card 
    let selectedFilteredIndex = newFilteredIndex % this.filteredCards.length;

    //If it's the last card
    if (this.filteredIndex == (this.filteredCards.length - 1)) {
      //If we're moving from the last -> first
      if (selectedFilteredIndex == 0) {
        this.showNextCard();
        return;
      }
    }
    //If it's the first card
    else if (this.filteredIndex == 0) {
      //If we're moving from first-> last
      if (selectedFilteredIndex == (this.filteredCards.length - 1)) {
        this.showPreviousCard();
        return;
      }
    }

    if (selectedFilteredIndex > this.filteredIndex)
      this.showNextCard();
    else if (selectedFilteredIndex < this.filteredIndex)
      this.showPreviousCard();
  }

  showPreviousCard() {
    this.carouselIndex--;
    if (this.carouselIndex < 0) {
      this.filteredIndex = (this.filteredCards.length - (Math.abs(this.carouselIndex % this.filteredCards.length)) % this.filteredCards.length);
      if (this.filteredIndex >= this.filteredCards.length)
        this.filteredIndex = this.filteredIndex % this.filteredCards.length;
    }
    else
      this.filteredIndex = this.carouselIndex % this.filteredCards.length;
  }

  showNextCard() {
    this.carouselIndex++;
    if (this.carouselIndex < 0) {
      this.filteredIndex = (this.filteredCards.length - (Math.abs(this.carouselIndex % this.filteredCards.length)) % this.filteredCards.length);
      if (this.filteredIndex >= this.filteredCards.length)
        this.filteredIndex = this.filteredIndex % this.filteredCards.length;
    }
    else
      this.filteredIndex = this.carouselIndex % this.filteredCards.length;
  }

  cancel() {
    this.addCardEvent.emit();
  }

  add() {
    let selectedCardDefinition: ICardDefinition = this.filteredCards[this.filteredIndex];
    if (selectedCardDefinition.requiresLogin && this.sharedApp.accessToken == null) {
      this.sharedApp.showWarning("You must be logged in to add this card.");
      return;
    }

    //Create the card to pass in to manage layout
    let selectedCard = {
      id: -1, //Set to -1 since we don't have a value yet. It will be populated once we get it from the database
      definitionId: selectedCardDefinition.id,
      sequence: 0, //Set to 0 as default
      layoutId: 0,
      layout: selectedCardDefinition.layouts[0],
      definition: selectedCardDefinition
    };

    this.addCardEvent.emit(selectedCard);
  }

}