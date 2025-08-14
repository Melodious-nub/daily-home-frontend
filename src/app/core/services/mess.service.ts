import { Injectable, DestroyRef, inject } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Api } from '../api';
import { WebSocketService } from './websocket.service';
import { UserState, RequestStatusResponse } from '../models/user-state.model';
import { Mess } from '../models/mess.model';

@Injectable({
  providedIn: 'root'
})
export class MessService {
  private userStateSubject = new BehaviorSubject<UserState | null>(null);
  public userState$ = this.userStateSubject.asObservable();
  
  private isInitializedSubject = new BehaviorSubject<boolean>(false);
  public isInitialized$ = this.isInitializedSubject.asObservable();
  
  private pollingInterval: any;
  private destroyRef = inject(DestroyRef);

  constructor(
    private api: Api,
    private webSocketService: WebSocketService
  ) {
    // Auto-cleanup when service is destroyed
    this.destroyRef.onDestroy(() => {
      this.stopStatusPolling();
    });

    // Listen to WebSocket events
    this.webSocketService.events$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(event => {
      this.handleWebSocketEvent(event);
    });
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
          
          // Connect to WebSocket if user has a mess or pending request
          if (userState.hasMess || userState.hasPendingRequest) {
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
   * Create new mess
   */
  createMess(data: { name: string; address?: string }): Observable<any> {
    return this.api.createMess(data);
  }

  /**
   * Join existing mess
   */
  joinMess(messId: string): Observable<any> {
    return new Observable(observer => {
      this.api.joinMess({ messId }).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (response) => {
          // Refresh user state after joining
          this.refreshUserState();
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Leave current mess
   */
  leaveMess(): Observable<any> {
    return new Observable(observer => {
      this.api.leaveMess().pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (response) => {
          // Refresh user state after leaving
          this.refreshUserState();
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Check request status
   */
  checkRequestStatus(): Observable<RequestStatusResponse> {
    return this.api.checkRequestStatus();
  }

  /**
   * Cancel join request
   */
  cancelRequest(): Observable<any> {
    return new Observable(observer => {
      this.api.cancelRequest().pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (response) => {
          // Refresh user state after cancellation
          this.refreshUserState();
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Accept member (admin only)
   */
  acceptMember(userId: string): Observable<any> {
    return this.api.acceptMember(userId);
  }

  /**
   * Reject member (admin only)
   */
  rejectMember(userId: string): Observable<any> {
    return this.api.rejectMember(userId);
  }

  /**
   * Start polling for request status updates
   */
  startStatusPolling(): void {
    if (this.pollingInterval) {
      this.stopStatusPolling();
    }

    this.pollingInterval = interval(5000).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.checkRequestStatus().subscribe({
        next: (response) => {
          this.handleRequestStatusUpdate(response);
        },
        error: (error) => {
          console.error('Error checking request status:', error);
        }
      });
    });
  }

  /**
   * Stop polling for request status updates
   */
  stopStatusPolling(): void {
    if (this.pollingInterval) {
      this.pollingInterval.unsubscribe();
      this.pollingInterval = null;
    }
  }

  /**
   * Handle request status updates
   */
  private handleRequestStatusUpdate(response: RequestStatusResponse): void {
    switch (response.status) {
      case 'accepted':
        this.stopStatusPolling();
        this.webSocketService.unsubscribeFromRequestStatus();
        // Refresh user state and redirect to dashboard
        this.refreshUserState();
        break;
      case 'rejected':
        this.stopStatusPolling();
        this.webSocketService.unsubscribeFromRequestStatus();
        // Refresh user state
        this.refreshUserState();
        break;
      case 'pending':
        // Continue polling
        break;
      case 'none':
        this.stopStatusPolling();
        this.webSocketService.unsubscribeFromRequestStatus();
        // Refresh user state
        this.refreshUserState();
        break;
    }
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
   * Handle join request updates from WebSocket
   */
  private handleJoinRequestUpdate(data: any): void {
    // Update user state based on WebSocket event
    this.refreshUserState();
  }

  /**
   * Handle mess updates from WebSocket
   */
  private handleMessUpdate(data: any): void {
    // Update user state based on WebSocket event
    this.refreshUserState();
  }

  /**
   * Connect to WebSocket
   */
  private connectWebSocket(): void {
    this.webSocketService.connect().then(() => {
      const userState = this.currentUserState;
      if (userState?.hasMess && userState.currentMess) {
        this.webSocketService.joinMessRoom(userState.currentMess.id);
      }
      if (userState?.hasPendingRequest) {
        this.webSocketService.subscribeToRequestStatus();
      }
    }).catch(error => {
      console.error('Failed to connect to WebSocket:', error);
    });
  }

  /**
   * Refresh user state
   */
  refreshUserState(): void {
    this.initializeUserState().subscribe();
  }

  /**
   * Clear user state (called on logout)
   */
  clearUserState(): void {
    this.userStateSubject.next(null);
    this.isInitializedSubject.next(false);
    this.stopStatusPolling();
    this.webSocketService.disconnect();
  }
}
