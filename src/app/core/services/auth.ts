import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Api } from '../api';

export interface User {
  id?: string;
  email: string;
  fullName?: string;
  isEmailVerified?: boolean;
  currentMess?: string;
  isMessAdmin?: boolean;
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
  
  // Add initialization state to prevent flash
  private isInitializedSubject = new BehaviorSubject<boolean>(false);
  public isInitialized$ = this.isInitializedSubject.asObservable();

  constructor(
    private api: Api,
    private router: Router
  ) {
    this.initializeAuth();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.getToken();
  }

  get isInitialized(): boolean {
    return this.isInitializedSubject.value;
  }

  // Initialize authentication state
  private initializeAuth(): void {
    // Clear any invalid tokens first
    this.clearInvalidTokens();
    
    // Load user from storage
    this.loadUserFromStorage();
    
    // Mark as initialized
    this.isInitializedSubject.next(true);
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
          // Redirect based on mess status
          this.handlePostAuthRedirect(response.user);
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
          // Redirect based on mess status
          this.handlePostAuthRedirect(response.user);
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
        // Silent error handling - just clear invalid data
        this.logout();
      }
    }
  }

  // Handle post-authentication redirect based on mess status
  private handlePostAuthRedirect(user: User): void {
    if (user.currentMess) {
      // User is part of a mess, redirect to dashboard
      this.router.navigate(['/dashboard']);
    } else {
      // User is not part of any mess, redirect to landing page
      this.router.navigate(['/landing']);
    }
  }

  // Authentication checks
  checkAuthAndRedirect(): boolean {
    if (this.isLoggedIn && this.isTokenValid()) {
      const user = this.currentUser;
      if (user) {
        this.handlePostAuthRedirect(user);
      } else {
        this.router.navigate(['/dashboard']);
      }
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
