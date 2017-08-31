// Define articles for dashboard-news-article(s)

import { ArticleCategory } from './dashboard-news-article.enum';

export interface NewsArticle {
    id: number;
    title: string;
    category: ArticleCategory;
    bodyPreview: string;
    body: string;
    date: Date;
}
