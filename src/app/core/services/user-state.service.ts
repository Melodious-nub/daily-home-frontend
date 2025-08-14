import { Injectable, DestroyRef, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Api } from '../api';
import { WebSocketService } from './websocket.service';
import { UserState, RequestStatusResponse } from '../models/user-state.model';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private userStateSubject = new BehaviorSubject<UserState | null>(null);
  public userState$ = this.userStateSubject.asObservable();
  
  private isInitializedSubject = new BehaviorSubject<boolean>(false);
  public isInitialized$ = this.isInitializedSubject.asObservable();
  
  private destroyRef = inject(DestroyRef);

  constructor(
    private api: Api,
    private router: Router,
    private webSocketService: WebSocketService
  ) {
    // Auto-cleanup when service is destroyed
    this.destroyRef.onDestroy(() => {
      this.unsubscribeFromWebSocket();
    });

    // Subscribe to WebSocket events
    this.setupWebSocketListeners();
  }

  get currentUserState(): UserState | null {
    return this.userStateSubject.value;
  }

  get isInitialized(): boolean {
    return this.isInitializedSubject.value;
  }

  /**
   * Initialize user state by fetching from API
   */
  initializeUserState(): Observable<UserState> {
    return new Observable(observer => {
      this.api.getUser().pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (userState: UserState) => {
          this.userStateSubject.next(userState);
          this.isInitializedSubject.next(true);
          
          // Connect to WebSocket and subscribe to updates if user has pending request
          if (userState.hasPendingRequest) {
            this.connectWebSocket();
          }
          
          observer.next(userState);
          observer.complete();
        },
        error: (error) => {
          console.error('Failed to initialize user state:', error);
          this.isInitializedSubject.next(true);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Handle routing based on user state
   */
  handleUserStateRouting(userState: UserState): void {
    // Add a small delay to ensure router is ready
    setTimeout(() => {
      if (userState.hasMess) {
        // User is a member or admin, redirect to main dashboard
        console.log('User has mess, redirecting to main dashboard');
        this.router.navigate(['/main/dashboard']);
      } else if (userState.hasPendingRequest) {
        // User has a pending request, redirect to request status
        console.log('User has pending request, redirecting to request status');
        this.router.navigate(['/landing/join-mess/request-status'], { 
          state: { mess: userState.pendingRequestMess } 
        });
      } else {
        // User has no mess and no pending request, redirect to landing
        console.log('User has no mess and no pending request, redirecting to landing');
        this.router.navigate(['/landing']);
      }
    }, 100);
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupWebSocketListeners(): void {
    this.webSocketService.events$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event) => {
      this.handleWebSocketEvent(event);
    });
  }

  /**
   * Handle WebSocket events
   */
  private handleWebSocketEvent(event: any): void {
    switch (event.type) {
      case 'join-request-update':
        this.handleJoinRequestUpdate(event.data);
        break;
      case 'mess-update':
        this.handleMessUpdate(event.data);
        break;
    }
  }

  /**
   * Handle join request status updates from WebSocket
   */
  private handleJoinRequestUpdate(data: RequestStatusResponse): void {
    console.log('WebSocket join request update:', data);
    
    switch (data.status) {
      case 'accepted':
        console.log('Request accepted via WebSocket, redirecting to dashboard');
        this.unsubscribeFromWebSocket();
        // Refresh user state and redirect to dashboard
        this.initializeUserState().subscribe((userState) => {
          this.handleUserStateRouting(userState);
        });
        break;
      case 'rejected':
        console.log('Request rejected via WebSocket, redirecting to landing');
        this.unsubscribeFromWebSocket();
        // Refresh user state and redirect to landing
        this.initializeUserState().subscribe((userState) => {
          this.handleUserStateRouting(userState);
        });
        break;
      case 'pending':
        // Continue listening for updates
        break;
      case 'none':
        console.log('No request found via WebSocket, redirecting to landing');
        this.unsubscribeFromWebSocket();
        // Refresh user state and redirect to landing
        this.initializeUserState().subscribe((userState) => {
          this.handleUserStateRouting(userState);
        });
        break;
    }
  }

  /**
   * Handle mess updates from WebSocket
   */
  private handleMessUpdate(data: any): void {
    console.log('WebSocket mess update:', data);
    // Refresh user state when mess data changes
    this.initializeUserState().subscribe((userState) => {
      this.handleUserStateRouting(userState);
    });
  }

  /**
   * Connect to WebSocket and subscribe to updates
   */
  private connectWebSocket(): void {
    const token = localStorage.getItem('token') || undefined;
    this.webSocketService.connect(token).then(() => {
      console.log('WebSocket connected for request status updates');
      this.webSocketService.subscribeToRequestStatus();
    }).catch((error) => {
      console.error('Failed to connect WebSocket:', error);
    });
  }

  /**
   * Unsubscribe from WebSocket updates
   */
  private unsubscribeFromWebSocket(): void {
    this.webSocketService.unsubscribeFromRequestStatus();
    this.webSocketService.disconnect();
  }

  /**
   * Start WebSocket connection for request status updates
   */
  startStatusPolling(): void {
    // This method is now deprecated, use WebSocket instead
    console.log('startStatusPolling is deprecated, use WebSocket instead');
    this.connectWebSocket();
  }

  /**
   * Stop WebSocket connection
   */
  stopStatusPolling(): void {
    // This method is now deprecated, use WebSocket instead
    console.log('stopStatusPolling is deprecated, use WebSocket instead');
    this.unsubscribeFromWebSocket();
  }

  /**
   * Cancel join request
   */
  cancelJoinRequest(): Observable<any> {
    return new Observable(observer => {
      this.api.cancelRequest().pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (response) => {
          console.log('Request cancelled successfully');
          // Stop WebSocket and refresh user state
          this.unsubscribeFromWebSocket();
          this.initializeUserState().subscribe((userState) => {
            this.handleUserStateRouting(userState);
          });
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('Error cancelling request:', error);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Refresh user state
   */
  refreshUserState(): void {
    this.initializeUserState().subscribe((userState) => {
      this.handleUserStateRouting(userState);
    });
  }

  /**
   * Clear user state (called on logout)
   */
  clearUserState(): void {
    this.userStateSubject.next(null);
    this.isInitializedSubject.next(false);
    this.unsubscribeFromWebSocket();
  }
} 
