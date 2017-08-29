// Define articles for dashboard-news-article(s)

import { ArticleCategory } from './dashboard-news-article.enum';

export interface NewsArticle {
    articleId: number;
    articleTitle: string;
    articleCategory: ArticleCategory;
    articleBodyPreview: string;
    articleBody: string;
    articleDate: Date;
}
