import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { interval, Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-otp-verify',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './otp-verify.html',
  styleUrl: './otp-verify.css'
})
export class OtpVerify implements OnInit {
  private destroyRef = inject(DestroyRef);
  
  resetData = {
    email: '',
    otp: '',
    newPassword: ''
  };

  email: string = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  resendLoading = false;
  showPassword = false;
  showSuccessState = false;
  
  // OTP digits array for individual input boxes
  otpDigits: string[] = ['', '', '', ''];
  
  // Timer properties
  countdownSeconds = 180; // 3 minutes
  currentCountdown = 0;
  canResend = false;
  private timerSubscription?: Subscription;

  constructor(
    private auth: Auth,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Check if user is already logged in
    if (this.auth.checkAuthAndRedirect()) {
      return;
    }
  }

  ngOnInit(): void {
    // Get email from router state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.resetData.email = navigation.extras.state['email'];
      this.email = navigation.extras.state['email'];
    } else {
      // Fallback to history state
      const historyState = history.state;
      if (historyState && historyState.email) {
        this.resetData.email = historyState.email;
        this.email = historyState.email;
      }
    }

    // If no email, redirect to forgot password
    if (!this.resetData.email) {
      this.router.navigate(['/forgot-password']);
      return;
    }

    // Start the countdown timer
    this.startCountdown();
  }

  private startCountdown(): void {
    this.currentCountdown = this.countdownSeconds;
    this.canResend = false;
    
    this.timerSubscription = interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.currentCountdown--;
        
        if (this.currentCountdown <= 0) {
          this.canResend = true;
          this.timerSubscription?.unsubscribe();
        }
      });
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.currentCountdown / 60);
    const seconds = this.currentCountdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Handle OTP input for individual boxes
  onOtpInput(index: number, event: any): void {
    const value = event.target.value;
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      this.otpDigits[index] = '';
      return;
    }
    
    this.otpDigits[index] = value;
    
    // Auto-focus next input if current input has value
    if (value && index < 3) {
      const nextInput = event.target.parentElement.children[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
    
    // Update the combined OTP string
    this.updateOtpString();
  }

  // Handle backspace in OTP inputs
  onOtpKeydown(index: number, event: any): void {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      const prevInput = event.target.parentElement.children[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  // Update the combined OTP string from individual digits
  private updateOtpString(): void {
    this.resetData.otp = this.otpDigits.join('');
  }

  // Check if OTP is complete (all 4 digits filled)
  isOtpComplete(): boolean {
    return this.otpDigits.every(digit => digit !== '');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.isOtpComplete()) {
      this.errorMessage = 'Please enter the complete 4-digit OTP';
      this.successMessage = '';
      this.showSuccessState = false;
      return;
    }

    if (!this.resetData.newPassword) {
      this.errorMessage = 'Please enter your new password';
      this.successMessage = '';
      this.showSuccessState = false;
      return;
    }

    if (this.resetData.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      this.successMessage = '';
      this.showSuccessState = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.showSuccessState = false;

    this.auth.resetPassword(this.resetData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          
          // Show professional success message
          this.successMessage = response.message || 'Your password has been successfully reset!';
          this.errorMessage = '';
          this.showSuccessState = true;
          
          // Navigate to login page after a short delay
          setTimeout(() => {
            this.router.navigate(['/login'], { 
              state: { 
                message: 'Password reset successful! You can now login with your new password.',
                type: 'success'
              } 
            });
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Password reset failed. Please try again.';
          this.successMessage = '';
          this.showSuccessState = false;
        }
      });
  }

  resendOtp(): void {
    if (!this.resetData.email || !this.canResend) {
      return;
    }

    this.resendLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.auth.requestPasswordReset(this.resetData.email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.resendLoading = false;
          this.successMessage = response.message || 'OTP has been resent to your email.';
          this.errorMessage = '';
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
          
          // Restart the countdown
          this.startCountdown();
        },
        error: (error) => {
          this.resendLoading = false;
          this.errorMessage = error.error?.message || 'Failed to resend OTP. Please try again.';
          this.successMessage = '';
        }
      });
  }

  goBackToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
