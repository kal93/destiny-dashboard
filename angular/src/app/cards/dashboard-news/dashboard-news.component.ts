import { Component } from '@angular/core';
import { CardComponent } from '../_base/card.component';
import { SharedApp } from 'app/shared/services/shared-app.service';

import { NewsArticle } from './dashboard-news-article/dashboard-news-article.interface';
import { NewsArticleService } from './dashboard-news-article/dashboard-news-article.service';

@Component({
  selector: 'dd-dashboard-news',
  templateUrl: './dashboard-news.component.html',
  styleUrls: ['../_base/card.component.scss', './dashboard-news.component.scss'],
  providers: [NewsArticleService]
})

export class DashboardNewsComponent extends CardComponent {
  CARD_DEFINITION_ID = 8;

  articles: NewsArticle[] = [];

  constructor(private newsArticleService: NewsArticleService, public sharedApp: SharedApp) {
    super(sharedApp);
  }

  ngOnInit() {
    super.ngOnInit();

    this.newsArticleService.getNewsArticles().then(articles => this.articles = articles);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}