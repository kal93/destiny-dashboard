import { Component, Input } from '@angular/core';

import { NewsArticle } from './dashboard-news-article.interface';

@Component({
  selector: 'dashboard-news-article',
  templateUrl: './dashboard-news-article.component.html',
  styleUrls: [ './dashboard-news-article.component.scss' ]
})

export class DashboardNewsArticle {
    
    @Input() article: NewsArticle;
    isCollapsed: boolean = true;
    
}
