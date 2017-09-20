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
    id: 7,
    title: "v1.2.2 release",
    category: ArticleCategory.SiteNews,
    bodyPreview: "Android and iOS supported.",
    body: "Native apps have been distributed to <a href='https://play.google.com/store/apps/details?id=net.destinydashboard'>Android</a> and <a href='https://itunes.apple.com/us/app/dashboard-for-destiny-2/id1281370879'>iOS</a> app stores.",
    date: new Date("Sept 16, 2017 8:00 am")
  },
  {
    id: 6,
    title: "v1.2.1 release",
    category: ArticleCategory.NewCard,
    bodyPreview: "Milestones added.",
    body: "View daily and weekly milestone challenges.",
    date: new Date("Sept 14, 2017 1:00 pm")
  },
  {
    id: 5,
    title: "v1.2.0 release",
    category: ArticleCategory.NewCard,
    bodyPreview: "Lore section added.",
    body: "Weapon and Armor Lore has been added.",
    date: new Date("Sept 12, 2017 1:00 pm")
  },
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
    id: 1,
    title: "v1.0.0 release",
    category: ArticleCategory.NewCard,
    bodyPreview: "It's here! Finally!",
    body: "On the eve of Destiny 2, Destiny Dashboard is released! Please report any issues, feedback, or feature requests to " + githubLink + ".",
    date: new Date("Sept 4, 2017 6:00 pm")
  }
];


