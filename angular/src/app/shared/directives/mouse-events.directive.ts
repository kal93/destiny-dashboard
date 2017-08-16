import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[ddMouseEvents]'
})
export class MouseEventsDirective {
  @Input()
  duration: number = 600;

  @Output()
  mouseDown = new EventEmitter<void>();

  @Output()
  mouseUp = new EventEmitter<void>();

  @Output()
  longPress = new EventEmitter<void>();

  private longPressTimeoutId: NodeJS.Timer;

  constructor() { }

  // Listen for mouse events
  @HostListener('mousedown', ['$event'])
  onMouseDown() {
    this.mouseDown.emit();
    // We'll call onLongPress after the set duration, unless it's canceled by the mouseUp event
    this.longPressTimeoutId = setTimeout(() => {
      this.longPress.emit();
    }, this.duration);
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp() {
    this.mouseUp.emit();
    clearTimeout(this.longPressTimeoutId);
  }

  // Listen for mobile events too
  @HostListener('touchstart', ['$event'])
  touchStart() {
    this.onMouseDown();
  }

  @HostListener('touchend', ['$event'])
  touchEnd() {
    this.onMouseUp();
  }

}
