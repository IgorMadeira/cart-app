import {
  Directive,
  ElementRef,
  output,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';

@Directive({
  selector: '[uiClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective implements OnInit, OnDestroy {
  uiClickOutside = output<MouseEvent>();

  private el = inject(ElementRef);
  private handler = (event: MouseEvent) => {
    if (!this.el.nativeElement.contains(event.target)) {
      this.uiClickOutside.emit(event);
    }
  };

  ngOnInit() {
    document.addEventListener('click', this.handler, true);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handler, true);
  }
}
