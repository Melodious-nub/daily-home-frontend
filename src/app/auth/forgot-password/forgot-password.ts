import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  private destroyRef = inject(DestroyRef);
  
  forgotPasswordData = {
    email: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showSuccessState = false;

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    // Check if user is already logged in
    if (this.auth.checkAuthAndRedirect()) {
      return;
    }
  }

  onSubmit(): void {
    if (!this.forgotPasswordData.email) {
      this.errorMessage = 'Please enter your email address';
      this.successMessage = '';
      this.showSuccessState = false;
      return;
    }

    if (!this.isValidEmail(this.forgotPasswordData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      this.successMessage = '';
      this.showSuccessState = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.showSuccessState = false;

    this.auth.requestPasswordReset(this.forgotPasswordData.email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          
          // Show professional success message
          this.successMessage = response.message || 'Password reset instructions have been sent to your email address.';
          this.errorMessage = '';
          this.showSuccessState = true;
          
          // Navigate to OTP verification page after a short delay
          setTimeout(() => {
            this.router.navigate(['/forgot-password/otp-verify'], { 
              state: { 
                email: this.forgotPasswordData.email 
              } 
            });
          }, 2500);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to send password reset link. Please try again.';
          this.successMessage = '';
          this.showSuccessState = false;
        }
      });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
