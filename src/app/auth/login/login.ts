import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, LoginRequest } from '../../core/services/auth';
import { NavigationService } from '../../core/services/navigation.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private destroyRef = inject(DestroyRef);
  
  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showSuccessState = false;
  showPassword = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private navigationService: NavigationService
  ) {
    // Check if user is already logged in
    if (this.auth.checkAuthAndRedirect()) {
      return;
    }
  }

  ngOnInit(): void {
    // Check for success message from password reset
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state as any;
      if (state.message && state.type === 'success') {
        this.successMessage = state.message;
        this.showSuccessState = true;
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          this.showSuccessState = false;
          this.successMessage = '';
        }, 5000);
      }
    } else {
      // Fallback to history state
      const historyState = history.state;
      if (historyState && historyState.message && historyState.type === 'success') {
        this.successMessage = historyState.message;
        this.showSuccessState = true;
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          this.showSuccessState = false;
          this.successMessage = '';
        }, 5000);
      }
    }
  }

  onSubmit(): void {
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please fill in all fields';
      this.successMessage = '';
      this.showSuccessState = false;
      return;
    }

    if (!this.isValidEmail(this.loginData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      this.successMessage = '';
      this.showSuccessState = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.showSuccessState = false;

    this.auth.login(this.loginData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          // Navigation is handled in the auth service
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
          this.successMessage = '';
          this.showSuccessState = false;
        }
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
