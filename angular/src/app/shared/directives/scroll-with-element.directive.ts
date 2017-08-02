
import { ChangeDetectorRef, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[ddScrollWithElement]'
})
export class ScrollWithElementDirective {
  @Input()
  scrollContainer: HTMLDivElement;

  mutationObserver: MutationObserver;

  constructor(private changeDetectorRef: ChangeDetectorRef, private elementRef: ElementRef) { }

  ngOnInit() {
    //Watch child for property changes so we know when to scroll the container
    this.mutationObserver = new MutationObserver(mutations => {
      this.checkScrollPosition();
    });

    this.mutationObserver.observe(this.elementRef.nativeElement, { attributes: true });
  }

  checkScrollPosition() {
    //Detect scrolling after next angular render
    this.changeDetectorRef.detectChanges();

    //Make sure the new position is visible in the scroll

    if (this.scrollContainer.scrollHeight > this.scrollContainer.clientHeight) {
      //Shortcut for variables
      var targetElement = this.elementRef.nativeElement;

      //Set container and target element positions
      var gridItemTop = targetElement.offsetTop;
      var gridItemBottom = gridItemTop + targetElement.clientHeight + 5;
      var containerTop = this.scrollContainer.scrollTop;
      var containerBottom = containerTop + this.scrollContainer.clientHeight;

      //If the position of the target element is past the bottom of the continer, scroll down (And vice versa)
      if (gridItemBottom > containerBottom) {
        while (gridItemBottom > containerBottom) {
          this.scrollContainer.scrollTop += targetElement.clientHeight;
          gridItemBottom = gridItemBottom - targetElement.clientHeight;
        }
      }
      else if (gridItemTop < containerTop)
        this.scrollContainer.scrollTop = gridItemTop;
    }
  }

}
