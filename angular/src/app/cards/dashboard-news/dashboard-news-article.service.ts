import { Injectable } from '@angular/core';

import { NewsArticle } from './dashboard-news-article.interface';
import { ARTICLES } from './dashboard-news-articles';

@Injectable()
export class NewsArticleService {

  getNewsArticles(): Promise<NewsArticle[]> {
    return Promise.resolve(ARTICLES);
  }

}