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

@Directive({
  selector: '[appPreventCopy]',
  standalone: true
})
export class PreventCopyDirective {
  constructor(private el: ElementRef) {}

  @HostListener('copy', ['$event'])
  onCopy(event: ClipboardEvent) {
    // Prevent copying - keeps copy disabled
    event.preventDefault();
    return false;
  }

  @HostListener('cut', ['$event'])
  onCut(event: ClipboardEvent) {
    // Prevent cutting - keeps cut disabled
    event.preventDefault();
    return false;
  }

  // PASTE PREVENTION - COMMENTED OUT FOR NOW
  // Uncomment the following block when paste prevention is needed again
  /*
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    // Prevent pasting - currently disabled to allow paste functionality
    event.preventDefault();
    return false;
  }
  */

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent) {
    // Prevent context menu - keeps right-click disabled
    event.preventDefault();
    return false;
  }

  @HostListener('selectstart', ['$event'])
  onSelectStart(event: Event) {
    // Prevent context menu - keeps right-click disabled
    event.preventDefault();
    return false;
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent) {
    // Prevent drag and drop
    event.preventDefault();
    return false;
  }
} 