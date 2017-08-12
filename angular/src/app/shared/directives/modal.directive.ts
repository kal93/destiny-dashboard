import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, Output, Renderer } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'

@Directive({
  selector: '[ddModal]',
  host: {
    '[style.position]': "'absolute'",
    '[style.top]': screen.width < 600 ? '"20px"' : '"10vh"',
    '[style.left]': "'50%'",
    '[style.transform]': "'translateX(-50%)'",
    '[style.transition]': "safeTransition",
    '[style.box-shadow]': "safeBoxShadow",
    '[style.opacity]': "opacity",
    '[style.z-index]': "2"
  }
})

//You should call closeModal when closing the modal for animations to work properly
export class ModalDirective {
  @Output()
  modalClosedEvent = new EventEmitter<void>();

  @Input()
  dimShouldFadeIn: boolean = false;

  private safeTransition: any;
  private safeBoxShadow: any;
  private opacity: number = 0;

  private dimElement: HTMLDivElement;

  private transitionTimeMs: number = 300;

  constructor(private elementRef: ElementRef, private renderer: Renderer, private sanitizer: DomSanitizer) {
    this.safeTransition = sanitizer.bypassSecurityTrustStyle('opacity ' + this.transitionTimeMs + 'ms ease');
    this.safeBoxShadow = sanitizer.bypassSecurityTrustStyle('0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)');
  }

  ngAfterViewInit() {
    //Create DOM element for screen dimmer
    this.dimElement = this.renderer.createElement(this.elementRef.nativeElement.parentNode, 'div');
    this.renderer.setElementStyle(this.dimElement, "position", "absolute");
    this.renderer.setElementStyle(this.dimElement, "top", "0");
    this.renderer.setElementStyle(this.dimElement, "right", "0");
    this.renderer.setElementStyle(this.dimElement, "bottom", "0");
    this.renderer.setElementStyle(this.dimElement, "left", "0");
    this.renderer.setElementStyle(this.dimElement, "transition", 'opacity ' + this.transitionTimeMs + 'ms ease');
    this.renderer.setElementStyle(this.dimElement, "z-index", "1");
    if (this.dimShouldFadeIn)
      this.renderer.setElementStyle(this.dimElement, "backgroundColor", "rgba(0, 0, 0, 0)");
    else
      this.renderer.setElementStyle(this.dimElement, "backgroundColor", "rgba(0, 0, 0, .6)");

    //Close if dim screen is clicked
    this.renderer.listen(this.dimElement, 'click', (event) => {
      this.closeModal();
    })

    window.scrollTo(0, 0);

    //Wait until elements are drawn on page before fading them in
    setTimeout(() => {
      if (this.dimShouldFadeIn)
        this.renderer.setElementStyle(this.dimElement, "backgroundColor", "rgba(0, 0, 0, .6)");
      this.opacity = 1;
    }, 50);
  }

  public closeModal() {
    this.opacity = 0;

    this.renderer.setElementStyle(this.dimElement, "backgroundColor", "rgba(0, 0, 0, 0)");

    //Set timeout to allow elements to fade
    setTimeout(() => {
      this.modalClosedEvent.emit();
      this.dimElement.remove();
    }, this.transitionTimeMs * .75);
  }

}
