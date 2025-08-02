import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Api } from '../api';

export interface User {
  id?: string;
  email: string;
  fullName?: string;
  // Add other user properties as needed
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface SignupResponse {
  message: string;
  userId: string;
}

export interface OtpVerifyRequest {
  userId: string;
  otp: string;
}

export interface OtpVerifyResponse {
  message: string;
  token: string;
  user: User;
}

export interface ResendOtpRequest {
  userId: string;
}

export interface ResendOtpResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private api: Api,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Login functionality
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return new Observable(observer => {
      this.api.login(credentials).subscribe({
        next: (response: LoginResponse) => {
          this.setToken(response.token);
          this.setUser(response.user);
          observer.next(response);
          observer.complete();
          // Redirect to dashboard after successful login
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  // Signup functionality - no navigation, handled by component
  signup(userData: SignupRequest): Observable<SignupResponse> {
    return this.api.signup(userData);
  }

  // OTP verification functionality
  verifyOtp(otpData: OtpVerifyRequest): Observable<OtpVerifyResponse> {
    return new Observable(observer => {
      this.api.verifyOtp(otpData).subscribe({
        next: (response: OtpVerifyResponse) => {
          this.setToken(response.token);
          this.setUser(response.user);
          observer.next(response);
          observer.complete();
          // Redirect to dashboard after successful OTP verification
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  // Resend OTP functionality
  resendOtp(userId: string): Observable<ResendOtpResponse> {
    const request: ResendOtpRequest = { userId };
    return this.api.resendOtp(request);
  }

  // Logout functionality
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Token management
  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from storage:', error);
        this.logout();
      }
    }
  }

  // Authentication checks
  checkAuthAndRedirect(): boolean {
    if (this.isLoggedIn && this.isTokenValid()) {
      this.router.navigate(['/dashboard']);
      return true;
    }
    return false;
  }

  shouldRedirectToLogin(): boolean {
    return !this.isLoggedIn || !this.isTokenValid();
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Add token expiration check if needed
    // For now, just check if token exists
    return true;
  }

  clearInvalidTokens(): void {
    if (!this.isTokenValid()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.currentUserSubject.next(null);
    }
  }

  // Password reset functionality
  requestPasswordReset(email: string): Observable<any> {
    return this.api.requestPasswordReset({ email });
  }

  resetPassword(data: any): Observable<any> {
    return this.api.resetPassword(data);
  }
}
