import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[ddMouseEvents]'
})
export class MouseEventsDirective {
  @Input()
  duration: number = 400;

  @Output()
  mouseDown = new EventEmitter<void>();

  @Output()
  mouseUp = new EventEmitter<void>();

  @Output()
  longPress = new EventEmitter<void>();

  private supportsTouch: boolean = false;

  private longPressTimeoutId: NodeJS.Timer;
  private longPressHappened: boolean = false;

  constructor() { }

  // Listen for mouse events
  @HostListener('mousedown', ['$event'])
  onMouseDown() {
    // If this device supports touchstart, don't handle mouseDown event
    if (this.supportsTouch) return;
    this.down();
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp() {
    if (this.supportsTouch) return;
    this.up();
  }

  // Listen for mobile events too
  @HostListener('touchstart', ['$event'])
  touchStart(event: TouchEvent) {
    this.supportsTouch = true;
    this.down();
  }

  @HostListener('touchend', ['$event'])
  touchEnd(event: TouchEvent) {
    this.supportsTouch = true;
    this.up();
  }

  down() {
    this.mouseDown.emit();
    this.longPressHappened = false;
    this.longPressTimeoutId = setTimeout(() => {
      this.longPress.emit();
      this.longPressHappened = true;
    }, this.duration);
  }

  up() {
    if (!this.longPressHappened)
      this.mouseUp.emit();
    clearTimeout(this.longPressTimeoutId);
  }

}
