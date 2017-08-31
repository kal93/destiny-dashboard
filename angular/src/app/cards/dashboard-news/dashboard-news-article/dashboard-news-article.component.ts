import { Component, Input } from '@angular/core';
import { fadeIn } from 'app/shared/animations';
import { DomSanitizer } from '@angular/platform-browser';

import { NewsArticle } from './dashboard-news-article.interface';

@Component({
  selector: 'dashboard-news-article',
  templateUrl: './dashboard-news-article.component.html',
  styleUrls: ['./dashboard-news-article.component.scss'],
  animations: [fadeIn()]
})

export class DashboardNewsArticle {
  constructor(public domSanitizer: DomSanitizer) { }
  @Input() article: NewsArticle;

  isCollapsed: boolean = true;

}
