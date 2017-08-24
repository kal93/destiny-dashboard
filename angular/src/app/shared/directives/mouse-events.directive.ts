import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

import { debounceBy } from '../../shared/decorators';

@Directive({
  selector: '[ddMouseEvents]'
})
export class MouseEventsDirective {
  @Input()
  longPressDuration: number = 450;

  @Output()
  mouseDown = new EventEmitter<void>();

  @Output()
  mouseUp = new EventEmitter<void>();

  @Output()
  longPress = new EventEmitter<void>();

  private supportsTouch: boolean = false;

  private longPressTimeoutId: NodeJS.Timer;
  private longPressHappened: boolean = false;

  private touchStartY: number;
  private touchDelta: number = 10;
  private cancelTouchAndPress: boolean = false;

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
    this.touchStartY = event.touches[0].clientY;
    this.supportsTouch = true;
    this.down();
  }

  @HostListener('touchmove', ['$event'])
  @debounceBy(50)
  touchMove(event: TouchEvent) {
    // If we already know we're going to cancel events, return
    if (this.cancelTouchAndPress) return;

    // If user has dragged over the acceptable delta, cancel the long press handler
    let dif = Math.abs(this.touchStartY - event.touches[0].clientY);
    if (dif > this.touchDelta) {
      this.cancelTouchAndPress = true;
      clearTimeout(this.longPressTimeoutId);
    }
  }

  @HostListener('touchend', ['$event'])
  touchEnd(event: TouchEvent) {
    this.supportsTouch = true;
    this.up();
  }

  down() {
    this.mouseDown.emit();
    this.longPressHappened = false;
    this.cancelTouchAndPress = false;
    this.longPressTimeoutId = setTimeout(() => {
      this.longPress.emit();
      this.longPressHappened = true;
    }, this.longPressDuration);
  }

  up() {
    if (!this.longPressHappened && !this.cancelTouchAndPress)
      this.mouseUp.emit();
    clearTimeout(this.longPressTimeoutId);
  }

}