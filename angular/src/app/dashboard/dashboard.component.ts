import { Component, ViewChild } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { NavigationEnd, Router } from '@angular/router';
import { ModalDirective } from '../shared/directives/modal.directive';
import { SharedApp } from '../shared/services/shared-app.service';
import { SharedDashboard } from './shared-dashboard.service';
import { ConfirmDialog } from '../shared/dialogs/confirm.component';
import { SimpleInputDialog } from '../shared/dialogs/simple-input.component';

import { debounceBy } from '../shared/decorators';
import { fadeInChildren, fadeInOut } from '../shared/animations';
import { ISubNavItem, IToolbarItem } from '../nav/nav.interface';
import { ICard, IUserDashboard } from '../cards/_base/card.interface';

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'dd-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [fadeInChildren(), fadeInOut()],
  //Inject any destiny related services that will be used in cards
  providers: []
})
export class DashboardComponent {
  @ViewChild(ModalDirective)
  modalDirective: ModalDirective;

  // Application events
  windowResizedSubscription: Subscription;
  userDashboardChangedSubscription: Subscription;

  // Nav 
  tutorialEditDashboardSubscription: Subscription;
  tutorialAddCardSubscription: Subscription;

  // Dashboard layout
  isDashboardCurrentRoute: boolean = true;
  gutterSize: number;
  columnCount: number;

  // Add card 
  showAddCard: boolean = false;

  // Edit layout
  layoutBeforeEdit: Map<number, ICard>;
  dashboardNameBeforeEdit: string;

  constructor(public mdDialog: MdDialog, public router: Router, public sharedApp: SharedApp, public sharedDashboard: SharedDashboard) {
    this.setColumnCount();
    this.setSubNavItems();
  }

  ngOnInit() {
    // Application Events
    this.windowResizedSubscription = this.sharedApp.windowResizedSubject.subscribe(() => { this.setColumnCount(); });

    // Tutorial Events
    this.tutorialEditDashboardSubscription = this.sharedApp.tutorialEditDashboardSubject.subscribe((show) => {
      this.showAddCard = false;
      this.setEditMode(show);
    });
    this.tutorialAddCardSubscription = this.sharedApp.tutorialAddCardSubject.subscribe((show) => {
      if (show) this.showAddCard = true;
      else if (this.modalDirective) this.modalDirective.closeModal();
    });

    // Router Events - Subscribe to Router Events since Dashboard is special and is preserved when route changes. Search "CustomReuseStrategy"
    this.router.events.filter(e => e instanceof NavigationEnd).subscribe((e: NavigationEnd) => {
      this.isDashboardCurrentRoute = e.url == "/dashboard";
      if (this.isDashboardCurrentRoute)
        this.setSubNavItems();
      else
        this.cancelEditMode();
    });
  }

  ngOnDestroy() {
    this.windowResizedSubscription.unsubscribe();
    this.tutorialAddCardSubscription.unsubscribe();
    this.tutorialEditDashboardSubscription.unsubscribe();
    this.userDashboardChangedSubscription.unsubscribe();
  }

  setSubNavItems() {
    this.sharedApp.subNavItems = new Array<ISubNavItem>();

    // Create dashboard subNavItem
    this.sharedApp.subNavItems.push({
      title: 'Create Dashboard', materialIcon: 'library_add',
      selectedCallback: (subNavItem: ISubNavItem) => {
        if (this.sharedApp.accessToken == null) {
          this.sharedApp.showWarning("Please log in to create dashboards.");
          return;
        }
        if (this.sharedDashboard.userDashboards.length >= 7) {
          this.sharedApp.showWarning("You can only create up to 7 dashboards.");
          return;
        }

        let dialogRef: MdDialogRef<SimpleInputDialog> = this.mdDialog.open(SimpleInputDialog, { height: '240px', width: '340px', });
        dialogRef.componentInstance.title = "Create Dashboard";
        dialogRef.componentInstance.inputPlaceholder = "Dashboard Name";
        dialogRef.componentInstance.inputValue = this.sharedDashboard.generateDashboardName();
        dialogRef.afterClosed().subscribe((result: string) => {
          if (result == "Save") {
            // Deselect all other nav items
            this.sharedApp.subNavItems.forEach(subNavItem => subNavItem.selectedStyle = false);

            // Create new dashboard object with no cards and add it to the user's cards
            let newDashboard: IUserDashboard = { id: -1, name: dialogRef.componentInstance.inputValue, cards: [] };
            this.sharedDashboard.userDashboards.push(newDashboard);

            // Set this as the newly selected dashboard and send to database
            this.sharedDashboard.selectedDashboard = newDashboard;
            this.sharedDashboard.saveUserDashboard(this.sharedDashboard.selectedDashboard).then(() => {
              // Turn on edit mode, and show add card
              this.setEditMode(true);
              this.showAddCard = true;
            });
          }
        });
      }
    });

    // Edit card subNavItem
    this.sharedApp.subNavItems.push({
      title: 'Edit Current Dashboard', materialIcon: 'format_line_spacing',
      selectedCallback: (subNavItem: ISubNavItem) => {
        this.showAddCard = false;
        this.setEditMode(true);
      }
    });
  }

  setToolbarItems() {
    this.sharedApp.toolbarItems = new Array<IToolbarItem>();

    //If we're not in edit mode, do not set toolbar items
    if (!this.sharedDashboard.editMode)
      return;

    // Delete toolbar item
    if (this.sharedDashboard.userDashboards.length > 1) {
      this.sharedApp.toolbarItems.push({
        title: "Delete", materialIcon: "delete_forever",
        selectedCallback: (subNavItem: IToolbarItem) => {
          this.showAddCard = false;
          // Deselect all other nav items
          this.sharedApp.subNavItems.forEach(subNavItem => subNavItem.selectedStyle = false);

          let dialogRef: MdDialogRef<ConfirmDialog> = this.mdDialog.open(ConfirmDialog, { height: '210px', width: '300px', });
          dialogRef.componentInstance.title = "Confirm Delete";
          dialogRef.componentInstance.message = "Are you sure you want to delete this dashboard?";
          dialogRef.afterClosed().subscribe((result: string) => {
            if (result == "Yes") {
              // Remove dashboard from database
              this.sharedDashboard.deleteUserDashboard(this.sharedDashboard.selectedDashboard);

              // Turn off edit mode toolbar
              this.setEditMode(false);
            }
          });
        }
      });
    }

    // Add Card toolbar item
    this.sharedApp.toolbarItems.push({
      title: "Add Card", materialIcon: "add_box",
      selectedCallback: (subNavItem: IToolbarItem) => {
        if (this.sharedDashboard.selectedDashboard.cards.length >= 20) {
          this.sharedApp.showWarning("You can only add up to 20 cards per dashboard.");
          return;
        }
        this.showAddCard = true;
      }
    });

    // Cancel toolbar item
    this.sharedApp.toolbarItems.push({
      title: "Cancel", materialIcon: "cancel",
      selectedCallback: (subNavItem: IToolbarItem) => {
        this.showAddCard = false;
        this.cancelEditMode();
        this.setToolbarItems();
      }
    });

    // Save toolbar item
    this.sharedApp.toolbarItems.push({
      title: "Save", materialIcon: "save",
      selectedCallback: (subNavItem: IToolbarItem) => {
        if (this.sharedApp.accessToken == null) {
          this.sharedApp.showWarning("Please log in to save your dashboard.");
        }
        else {
          if (this.sharedDashboard.selectedDashboard.name.trim().length < 1) {
            this.sharedApp.showWarning("Dashboard name is required.");
            return;
          }
          this.sharedDashboard.saveUserDashboard(this.sharedDashboard.selectedDashboard);
          this.layoutBeforeEdit = new Map<number, ICard>();
        }

        this.showAddCard = false;
        this.setEditMode(false);
        this.setToolbarItems();
      }
    });
  }

  setEditMode(editOn: boolean) {
    this.sharedDashboard.editMode = editOn;
    this.setToolbarItems();

    if (editOn) {
      //Save current layout state
      this.dashboardNameBeforeEdit = this.sharedDashboard.selectedDashboard.name;
      this.layoutBeforeEdit = new Map<number, ICard>();
      this.sharedDashboard.selectedDashboard.cards.forEach((card: ICard) => {
        this.layoutBeforeEdit.set(card.id, this.sharedApp.deepCopyObject(card));
      });
    }
  }

  cancelEditMode() {
    if (this.sharedDashboard.editMode == false)
      return;

    this.sharedDashboard.editMode = false;

    // Create alias since we'll be using this a lot
    let selectedDashboard = this.sharedDashboard.selectedDashboard;

    // Reset dashboard name
    selectedDashboard.name = this.dashboardNameBeforeEdit;

    // Reset dashboard cards
    for (let i = 0; i < selectedDashboard.cards.length; i++) {
      let card = selectedDashboard.cards[i];
      let cardBeforeEdit = this.layoutBeforeEdit.get(card.id);

      // If cardBeforeEdit is null, remove it from the layout as it was not in the original layout
      if (cardBeforeEdit == null || card.id == -1) {
        selectedDashboard.cards.splice(i, 1);
        i--;
        continue;
      }

      card.sequence = cardBeforeEdit.sequence;
      card.layoutId = cardBeforeEdit.layoutId;
      card.layout = cardBeforeEdit.definition.layouts[card.layoutId];

      // Delete cards from map so we knows what's left at the end
      this.layoutBeforeEdit.delete(card.id);
    }

    // Restore any cards that were deleted
    this.layoutBeforeEdit.forEach((card: ICard, id: number) => {
      selectedDashboard.cards.push(card);
    });

    // Sort based on new sequence
    selectedDashboard.cards.sort((a, b) => { return a.sequence - b.sequence; });

    // Reset edit mode variable
    this.layoutBeforeEdit = new Map<number, ICard>();
  }

  removeCard(cardToRemove: ICard) {
    let selectedDashboard = this.sharedDashboard.selectedDashboard;
    // Remove card from user cards
    for (let i = 0; i < selectedDashboard.cards.length; i++) {
      if (selectedDashboard.cards[i] == cardToRemove) {
        selectedDashboard.cards.splice(i, 1);
        break;
      }
    }

    // Set sequence for remaining cards
    for (let i = 0; i < selectedDashboard.cards.length; i++)
      selectedDashboard.cards[i].sequence = i;
  }

  setCardSize(card: ICard, byValue: number) {
    card.layoutId += byValue;
    card.layout = card.definition.layouts[card.layoutId];
  }

  setCardPosition(card: ICard, byValue: number) {
    let neighborCardIndex = card.sequence + byValue;
    if (neighborCardIndex < 0 || neighborCardIndex >= this.sharedDashboard.selectedDashboard.cards.length)
      return;

    // Update next or previous card sequence
    this.sharedDashboard.selectedDashboard.cards[neighborCardIndex].sequence += (byValue * -1);

    // Update current card sequence
    card.sequence += byValue;

    // Sort based on new sequence
    this.sharedDashboard.selectedDashboard.cards.sort((a, b) => { return a.sequence - b.sequence; });
  }

  // Add Card
  addCard(cardToAdd: ICard) {
    if (cardToAdd != null) {
      window.scrollTo(0, 0);

      // Get the dashboard object and add this card to it
      this.sharedDashboard.selectedDashboard.cards.unshift(cardToAdd);

      // Set sequence for remaining cards
      for (let i = 0; i < this.sharedDashboard.selectedDashboard.cards.length; i++)
        this.sharedDashboard.selectedDashboard.cards[i].sequence = i;
    }
    this.modalDirective.closeModal();
  }

  // Set the number of columns in our md-grid-list. The amount of columns change depending on the screen width
  @debounceBy(100)
  setColumnCount() {
    // 187 is the magic number apparently
    this.columnCount = Math.max(Math.round(this.sharedApp.windowWidth / 187), 3);
    this.gutterSize = this.columnCount + 1;
  }
}