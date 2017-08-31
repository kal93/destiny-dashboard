import { Injectable } from '@angular/core';

import { NewsArticle } from './dashboard-news-article.interface';
import { ArticleCategory } from './dashboard-news-article.enum';

@Injectable()
export class NewsArticleService {
  getNewsArticles(): Promise<NewsArticle[]> {
    return Promise.resolve(ARTICLES);
  }
}

let redditLink = "<a style='color: #2196F3' target='_blank' href='https://www.reddit.com/r/DestinyDashboard/'>Reddit</a>";
let githubLink = "<a style='color: #2196F3' target='_blank' href='https://github.com/lax20attack/destiny-dashboard/'>GitHub</a>";

export const ARTICLES: NewsArticle[] = [
  {
    id: 1,
    title: "Inventory Manager",
    category: ArticleCategory.NewCard,
    bodyPreview: "Inventory Manager is ready for alpha testing.",
    body: "Inventory Manager is ready for alpha testing. Loadouts and item preview are not done, but item transferring are working. Please report any issues, feedback, or feature requests to " + githubLink + " or " + redditLink + ".",
    date: new Date("Aug 31, 2017 6:00 pm")
  },
  {
    id: 0,
    title: "Beta Released",
    category: ArticleCategory.SiteNews,
    bodyPreview: "Destiny Dashboard is now in Beta!",
    body: "Destiny Dashboard is now in Beta! Please report any issues, feedback, or feature requests to " + githubLink + " or " + redditLink + ".",
    date: new Date("Aug 30, 2017 6:00 pm")
  }
];


