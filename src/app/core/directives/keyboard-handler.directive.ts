import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NavigationService } from '../services/navigation.service';

@Directive({
  selector: '[appKeyboardHandler]',
  standalone: true
})
export class KeyboardHandlerDirective {
  @Input() hideOnBlur = true;
  @Input() scrollToElement = true;

  constructor(
    private el: ElementRef,
    private navigationService: NavigationService
  ) {}

  @HostListener('focus')
  onFocus() {
    // Optional: Add focus styling or behavior
    this.el.nativeElement.classList.add('keyboard-focused');
  }

  @HostListener('blur')
  onBlur() {
    // Remove focus styling
    this.el.nativeElement.classList.remove('keyboard-focused');
    
    // Hide keyboard on blur if configured
    if (this.hideOnBlur) {
      setTimeout(() => {
        this.navigationService.hideKeyboard();
      }, 100);
    }
  }

  @HostListener('keydown.enter')
  onEnter() {
    // Handle enter key press
    this.el.nativeElement.blur();
  }

  @HostListener('keydown.escape')
  onEscape() {
    // Handle escape key press
    this.el.nativeElement.blur();
  }

  @HostListener('input')
  onInput() {
    // Handle input changes
    // You can add custom logic here
  }
} 