import { Directive, ElementRef, EventEmitter, OnDestroy, Output } from '@angular/core';

@Directive({
  selector: '[ddMouseEvents]'
})
export class MouseEventsDirective implements OnDestroy {
  @Output()
  onMouseDown = new EventEmitter<void>();

  @Output()
  onMouseUp = new EventEmitter<void>();

  private mouseDownBound: boolean = false;
  private mouseUpBound: boolean = false;

  constructor(protected elementRef: ElementRef) {

  }

  ngOnInit() {
    //Manually subscribe to events instead of HostListener since we don't want to listen to events the parent element doesn't care about
    if (this.onMouseDown.observers.length > 0) {
      this.mouseDownBound = true;

      this.elementRef.nativeElement.addEventListener('mousedown', (mouseEvent: MouseEvent) => {
        this.mouseDownHandler();
      });

      this.elementRef.nativeElement.addEventListener('touchstart', (mouseEvent: MouseEvent) => {
        this.mouseDownHandler();
        event.preventDefault();
        event.stopPropagation();
      });
    }

    if (this.onMouseUp.observers.length > 0) {
      this.mouseUpBound = true;

      this.elementRef.nativeElement.addEventListener('mouseup', (mouseEvent: MouseEvent) => {
        this.mouseUpHandler();
      });

      this.elementRef.nativeElement.addEventListener('touchend', (mouseEvent: MouseEvent) => {
        this.mouseUpHandler();
        event.preventDefault();
        event.stopPropagation();
      });
    }
  }

  ngOnDestroy() {
    if (this.mouseDownBound) {
      this.elementRef.nativeElement.removeEventListener('mousedown');
      this.elementRef.nativeElement.removeEventListener('touchstart');
    }
    if (this.mouseUpBound) {
      this.elementRef.nativeElement.removeEventListener('mouseup');
      this.elementRef.nativeElement.removeEventListener('touchend');
    }
  }

  mouseDownHandler() {
    console.log("mouseDownHandler");
  }
  mouseUpHandler() {
    console.log("mouseUpHandler");
  }

}
