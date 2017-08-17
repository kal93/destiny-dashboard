import { Component, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from 'app/shared/services/shared-app.service';
import { BungieNewsService } from './bungie-news.service';

import { INews, INewsResult } from 'app/bungie/services/interface.barrel';
import { ITwitterReponse, Tweet } from './bungie-news.interface';
import { NewsTypes } from 'app/bungie/services/enums.interface';

import { bounceChildrenFromLeft } from 'app/shared/animations';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'dd-bungie-news',
  templateUrl: './bungie-news.component.html',
  styleUrls: ['../_base/card.component.scss', './bungie-news.component.scss'],
  providers: [BungieNewsService],
  animations: [bounceChildrenFromLeft(100)]
})
export class BungieNewsComponent extends CardComponent {
  CARD_DEFINITION_ID = 5;

  private currentPage: number = 0;

  public bungieNewsResults = new Array<INewsResult>();
  public bungieTwitterResults: ITwitterReponse;

  constructor(private bungieNewsService: BungieNewsService, public domSanitizer: DomSanitizer, public sharedApp: SharedApp) {
    super(sharedApp);
  }

  ngOnInit() {
    super.ngOnInit();

    this.getBungieTwitter();

    this.getNextPage();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  getBungieTwitter() {
    this.bungieNewsService.getBungieTwitter().then((bungieTwitterResults) => {
      this.bungieTwitterResults = bungieTwitterResults;
      this.bungieTwitterResults.tweets.forEach((tweet: Tweet) => {
        tweet.text = tweet.text.split("<br /><br />").join("<br />");
        tweet.createdAgoDate = new Date(Date.now() - tweet.createdAgoMs);
      });
    });
  }

  getNextPage() {
    this.currentPage++;

    this.bungieNewsService.getBungieNews(NewsTypes.ALL, this.currentPage, 2).then((bungieNews: INews) => {
      bungieNews.results.forEach((result: INewsResult) => {
        //result.properties.Content = result.properties.Content.replace(/\[\[.*\]/, '');
        let start = result.properties.Content.indexOf("[[");
        while (start != -1) {
          let end = result.properties.Content.indexOf("]]");
          if (end == -1)
            break;
          let parsed = result.properties.Content.substr(0, start);
          result.properties.Content = parsed + result.properties.Content.substr(end + 2);
          start = result.properties.Content.indexOf("[[");
        }
        this.bungieNewsResults.push(result);
      });

    });
  }

  loadMore() {
    this.currentPage++;
    this.getNextPage();
  }

}
