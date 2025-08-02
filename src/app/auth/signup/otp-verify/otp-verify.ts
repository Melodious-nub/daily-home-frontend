import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth, OtpVerifyRequest } from '../../../core/services/auth';
import { interval, Subscription } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-otp-verify',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './otp-verify.html',
  styleUrl: './otp-verify.css'
})
export class OtpVerify implements OnInit, OnDestroy {
  otpData: OtpVerifyRequest = {
    userId: '',
    otp: ''
  };

  email: string = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  resendLoading = false;
  
  // OTP digits array for individual input boxes
  otpDigits: string[] = ['', '', '', ''];
  
  // Timer properties
  countdownSeconds = 180; // 10 seconds for testing, change to 180 for production
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
    console.log('OTP Verify component initialized');
    
    // Get userId and email from router state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.otpData.userId = navigation.extras.state['userId'];
      this.email = navigation.extras.state['email'];
      console.log('Received state data:', { userId: this.otpData.userId, email: this.email });
    } else {
      console.log('No state data found, checking history state');
      // Fallback to history state
      const historyState = history.state;
      if (historyState && historyState.userId) {
        this.otpData.userId = historyState.userId;
        this.email = historyState.email || '';
        console.log('Received history state data:', { userId: this.otpData.userId, email: this.email });
      }
    }

    // If no userId, redirect to signup
    if (!this.otpData.userId) {
      console.log('No userId found, redirecting to signup');
      this.router.navigate(['/signup']);
      return;
    }

    console.log('Starting countdown timer');
    // Start the countdown timer
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private startCountdown(): void {
    this.currentCountdown = this.countdownSeconds;
    this.canResend = false;
    
    this.timerSubscription = interval(1000).subscribe(() => {
      this.currentCountdown--;
      
      if (this.currentCountdown <= 0) {
        this.canResend = true;
        this.timerSubscription?.unsubscribe();
        console.log('Countdown finished, resend button enabled');
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
    this.otpData.otp = this.otpDigits.join('');
  }

  // Check if OTP is complete (all 4 digits filled)
  isOtpComplete(): boolean {
    return this.otpDigits.every(digit => digit !== '');
  }

  onSubmit(): void {
    if (!this.isOtpComplete()) {
      this.errorMessage = 'Please enter the complete 4-digit OTP';
      this.successMessage = '';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('Submitting OTP:', this.otpData);

    this.auth.verifyOtp(this.otpData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('OTP verification successful:', response);
        this.successMessage = response.message || 'OTP verified successfully!';
        // Navigation is handled in the auth service
      },
      error: (error) => {
        this.isLoading = false;
        console.error('OTP verification error:', error);
        this.errorMessage = error.error?.message || 'OTP verification failed. Please try again.';
        this.successMessage = '';
      }
    });
  }

  resendOtp(): void {
    if (!this.otpData.userId || !this.canResend) {
      console.log('Cannot resend OTP:', { userId: this.otpData.userId, canResend: this.canResend });
      return;
    }

    this.resendLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('Resending OTP for userId:', this.otpData.userId);

    this.auth.resendOtp(this.otpData.userId).subscribe({
      next: (response) => {
        this.resendLoading = false;
        console.log('OTP resent successfully:', response);
        this.successMessage = response.message || 'OTP has been resent to your email.';
        this.errorMessage = '';
        
        // Restart the countdown
        this.startCountdown();
      },
      error: (error) => {
        this.resendLoading = false;
        console.error('Resend OTP error:', error);
        this.errorMessage = error.error?.message || 'Failed to resend OTP. Please try again.';
        this.successMessage = '';
      }
    });
  }

  goBackToSignup(): void {
    this.router.navigate(['/signup']);
  }
}
