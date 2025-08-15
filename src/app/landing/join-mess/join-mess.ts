import { Component, DestroyRef, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { Api } from '../../core/api';
import { UserStateService } from '../../core/services/user-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-join-mess',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './join-mess.html',
  styleUrl: './join-mess.css'
})
export class JoinMess implements OnInit, OnDestroy {
  messCode: string = '';
  mess: any = null;
  isLoading: boolean = false;
  isSendingRequest: boolean = false;
  hasSearched: boolean = false;
  showRedirectingState: boolean = false;
  redirectingMessage: string = '';

  constructor(
    private router: Router, 
    private auth: Auth, 
    private api: Api, 
    private userStateService: UserStateService,
    private destroyRef: DestroyRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Reset component state when component initializes
    this.resetComponentState();
    
    // Listen to route changes to reset state when returning to this route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: NavigationEnd) => {
      if (event.url === '/landing/join-mess') {
        // Reset state when returning to join-mess route
        this.resetComponentState();
        // Force change detection to ensure UI updates
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions if needed
  }

  private resetComponentState(): void {
    // Reset all component state
    this.messCode = '';
    this.mess = null;
    this.isLoading = false;
    this.isSendingRequest = false;
    this.hasSearched = false;
    this.showRedirectingState = false;
    this.redirectingMessage = '';
    
    // Focus the input after a short delay to ensure it's ready
    setTimeout(() => {
      const inputElement = document.querySelector('.search-input') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
        inputElement.select();
      }
    }, 100);
  }

  goBack(): void {
    this.router.navigate(['/landing']);
  }

  onMessCodeInput(): void {
    // Ensure messCode is a string
    if (typeof this.messCode !== 'string') {
      this.messCode = '';
    }
    
    // Convert to string and ensure it's numeric
    this.messCode = this.messCode.toString().replace(/[^0-9]/g, '');
    
    // Clear result if code is less than 6 characters
    if (this.messCode.length < 6) {
      this.mess = null;
      this.hasSearched = false;
    }
    
    // Force change detection to ensure button state updates
    this.cdr.detectChanges();
  }

  onEnterKey(): void {
    // Trigger search when Enter key is pressed (mobile "Go" button)
    if (this.messCode.length >= 6 && !this.isLoading) {
      this.searchMess();
    }
  }

  onInputFocus(): void {
    // Ensure input is properly initialized when focused
    if (typeof this.messCode !== 'string') {
      this.messCode = '';
    }
    this.cdr.detectChanges();
  }

  onSearchButtonClick(): void {
    // Ensure messCode is properly initialized before searching
    if (typeof this.messCode !== 'string') {
      this.messCode = '';
    }
    
    // Only search if we have a valid code
    if (this.messCode && this.messCode.length >= 6 && !this.isLoading) {
      this.searchMess();
    }
  }

  searchMess(): void {
    // Ensure messCode is properly initialized
    if (typeof this.messCode !== 'string') {
      this.messCode = '';
    }
    
    // Ensure messCode is a string and at least 6 digits
    const code = this.messCode.toString().replace(/[^0-9]/g, '');
    
    if (code.length >= 6) {
      this.isLoading = true;
      this.hasSearched = true;
      this.mess = null;
      
      this.api.getMessWithCode(code).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res) => {
          this.mess = res;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          // console.log(err);
          this.mess = null;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.mess = null;
      this.hasSearched = false;
      this.cdr.detectChanges();
    }
  }

  sendJoinRequest(messId: string): void {
    this.isSendingRequest = true;
    this.api.joinMess({messId: messId}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        this.isSendingRequest = false;
        
        // Show redirecting state
        this.showRedirectingState = true;
        this.redirectingMessage = 'Request sent successfully! Redirecting to request status...';
        
        // Refresh user state and let UserStateService handle routing after a delay
        setTimeout(() => {
          this.userStateService.refreshUserState();
        }, 2000);
      },
      error: (err: any) => {
        console.log(err);
        Swal.fire('Error', err.error.message, 'error');
        this.isSendingRequest = false;
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }
} 