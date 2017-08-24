import { Component, ViewChild } from '@angular/core';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { RedditService } from './reddit.service';

import { bounceChildrenFromLeft } from 'app/shared/animations';
import { IRedditData } from './reddit.interface';

@Component({
  selector: 'dd-reddit',
  templateUrl: './reddit.component.html',
  styleUrls: ['../_base/card.component.scss', './reddit.component.scss'],
  providers: [RedditService],
  animations: [bounceChildrenFromLeft(100)]
})
export class RedditComponent extends CardComponent {
  CARD_DEFINITION_ID = 2;

  //All currently loaded results
  public redditResults = new Array<IRedditData>();

  public selectedTab: string = "";

  constructor(public sharedApp: SharedApp, private redditService: RedditService) {
    super(sharedApp);
  }

  ngOnInit() {
    super.ngOnInit();
    this.initializeTab('Hot');
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  initializeTab(tabType: string) {
    //Reset results
    this.redditResults = new Array<IRedditData>();

    //Set post type
    this.selectedTab = tabType;

    this.loadPosts()
  }

  loadPosts() {
    //Get Hot or New posts
    if (this.selectedTab == 'Hot')
      this.getHotPosts();
    else
      this.getNewPosts();
  }

  getHotPosts() {
    //Get the last object in loaded posts if one exists
    let afterQueryParm: string;
    if (this.redditResults.length > 0)
      afterQueryParm = "&after=" + this.redditResults[this.redditResults.length - 1].postId;

    //Make a network call
    this.redditService.getHotPosts(afterQueryParm).then((response) => {
      this.parseRedditResponse(response);
    }).catch((error) => {
      this.sharedApp.showError("Error getting Reddit data", error);
    });
  }

  getNewPosts() {
    //Get the last object in loaded posts if one exists
    let afterQueryParm: string;
    if (this.redditResults.length > 0)
      afterQueryParm = "&after=" + this.redditResults[this.redditResults.length - 1].postId;
    this.redditService.getNewPosts(afterQueryParm).then((response) => {
      this.parseRedditResponse(response);
    }).catch((error) => {
      this.sharedApp.showError("Error getting Reddit data", error);
    });
  }

  parseRedditResponse(response: any) {
    response.data.children.forEach(element => {
      let post = element.data;
      this.redditResults.push({
        postId: post.name,
        title: post.title,
        url: post.url,
        selftext: post.selftext,
        score: post.score,
        clicked: false
      });
    });
  }

}
