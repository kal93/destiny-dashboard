import { Injectable } from '@angular/core';

import { NewsArticle } from './dashboard-news-article.interface';
import { ArticleCategory } from './dashboard-news-article.enum';

@Injectable()
export class NewsArticleService {
  getNewsArticles(): Promise<NewsArticle[]> {
    return Promise.resolve(ARTICLES);
  }
}

let githubLink = "<a style='color: #2196F3' target='" + (window.cordova ? '_system' : '_blank') + "' href='https://github.com/lax20attack/destiny-dashboard/'>GitHub</a>";

export const ARTICLES: NewsArticle[] = [
  {
    id: 4,
    title: "v1.1.0 release",
    category: ArticleCategory.NewCard,
    bodyPreview: "Inventory now supports Destiny 2. Dashboard fully converted to D2.",
    body: "Yes, you read that right. Destiny 2 support is here!",
    date: new Date("Sept 7, 2017 12:00 pm")
  },
  {
    id: 3,
    title: "v1.0.7 release",
    category: ArticleCategory.NewCard,
    bodyPreview: "Database released!",
    body: "Search the entire Destiny 2 item database instantly!",
    date: new Date("Sept 6, 2017 2:00 am")
  },
  {
    id: 2,
    title: "v1.0.4 release",
    category: ArticleCategory.SiteNews,
    bodyPreview: "Destiny 2 Updates",
    body: "The dashboard has been converted to Destiny 2. Bungie API outages are preventing things from working properly at the moment.",
    date: new Date("Sept 5, 2017 6:00 pm")
  },
  {
    id: 1,
    title: "v1.0.0 release",
    category: ArticleCategory.NewCard,
    bodyPreview: "It's here! Finally!",
    body: "On the eve of Destiny 2, Destiny Dashboard is released! Please report any issues, feedback, or feature requests to " + githubLink + ".",
    date: new Date("Sept 4, 2017 6:00 pm")
  },
  {
    id: 0,
    title: "Inventory Manager",
    category: ArticleCategory.CardUpdate,
    bodyPreview: "Inventory Manager released!",
    body: "Inventory Manager is done! Multiple item transfer, Loadouts, Filtering, and Quick search have been added.",
    date: new Date("Sept 1, 2017 6:00 pm")
  }
];


