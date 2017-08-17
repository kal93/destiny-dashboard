import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
    selector: '[swipeable]'
})
export class Swipeable {
    @Output() swipedLeft = new EventEmitter();
    @Output() swipedRight = new EventEmitter();
    @Output() swipeableClick = new EventEmitter();

    private touchStartClientX: number = 0;
    private touchStartClientY: number = 0;

    private minimumDeltaX: number = 8;
    // private maximumDeltaY: number = 80;

    private emittedLeftOrRight: boolean = false;
    private mouseDownHappened: boolean = false;

    constructor() { }

    @HostListener('touchstart', ['$event'])
    onTouchStart(event: TouchEvent) {
        this.touchStartClientX = event.changedTouches[0].clientX;
        this.touchStartClientY = event.changedTouches[0].clientY;
    }

    @HostListener('touchend', ['$event'])
    onTouchEnd(event: TouchEvent) {
        this.handleEndEvent(event.changedTouches[0].clientX, event.changedTouches[0].clientY, event);
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        this.touchStartClientX = event.clientX;
        this.touchStartClientY = event.clientY;
        this.emittedLeftOrRight = false;
        this.mouseDownHappened = true;
    }
    @HostListener('document:mouseup', ['$event'])
    onMouseUp(event: MouseEvent) {
        if (this.mouseDownHappened) {
            this.handleEndEvent(event.clientX, event.clientY, event);
            this.mouseDownHappened = false;
        }
    }

    @HostListener('click', ['$event'])
    onMouseClick(event: MouseEvent) {
        //Hack to prevent mousedown/mouseup from triggering click event too
        if (!this.emittedLeftOrRight)
            this.swipeableClick.emit();
    }

    handleEndEvent(touchEndClientX: number, touchEndClientY: number, event: TouchEvent | MouseEvent) {
        //If the user has not dragged far enough in the X direction, don't consider it a swipe
        let movedDeltaX = touchEndClientX - this.touchStartClientX;
        if (Math.abs(movedDeltaX) < this.minimumDeltaX)
            return;

        //If the user has dragged too far in the Y direction, don't consider it a swipe
        //if (Math.abs(touchEndClientY - this.touchStartClientY) > this.maximumDeltaY) return;

        if (movedDeltaX > 0)
            this.swipedRight.emit();
        else
            this.swipedLeft.emit();

        this.emittedLeftOrRight = true;
    }
}