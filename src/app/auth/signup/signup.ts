import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, SignupRequest } from '../../core/services/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  private destroyRef = inject(DestroyRef);
  
  signupData: SignupRequest = {
    email: '',
    password: '',
    fullName: ''
  };

  isLoading = false;
  errorMessage = '';
  showPassword = false;

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
    if (!this.signupData.email || !this.signupData.password || !this.signupData.fullName) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (!this.isValidEmail(this.signupData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    if (this.signupData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.signup(this.signupData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          
          // Navigate to OTP verification page with state data
          this.router.navigate(['/signup/otp-verify'], { 
            state: { 
              userId: response.userId, 
              email: this.signupData.email 
            } 
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
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
