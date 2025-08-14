import { Injectable, DestroyRef, inject } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../environments/environment';
import { io, Socket } from 'socket.io-client';

export interface WebSocketEvent {
  type: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket | null = null;
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.isConnectedSubject.asObservable();
  
  private eventsSubject = new Subject<WebSocketEvent>();
  public events$ = this.eventsSubject.asObservable();
  
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Auto-cleanup when service is destroyed
    this.destroyRef.onDestroy(() => {
      this.disconnect();
    });
  }

  /**
   * Connect to WebSocket server with JWT authentication
   */
  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const authToken = token || localStorage.getItem('token');
      if (!authToken) {
        reject(new Error('No authentication token available'));
        return;
      }

      this.socket = io(environment.wsUrl, {
        auth: {
          token: authToken
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.isConnectedSubject.next(true);
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        this.isConnectedSubject.next(false);
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.isConnectedSubject.next(false);
        reject(error);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('WebSocket reconnected after', attemptNumber, 'attempts');
        this.isConnectedSubject.next(true);
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('WebSocket reconnection error:', error);
      });

      // Handle real-time events
      this.socket.on('join-request-update', (data) => {
        console.log('WebSocket: join-request-update received:', data);
        this.eventsSubject.next({ type: 'join-request-update', data });
      });

      this.socket.on('mess-update', (data) => {
        console.log('WebSocket: mess-update received:', data);
        this.eventsSubject.next({ type: 'mess-update', data });
      });

      this.socket.on('request-status-update', (data) => {
        console.log('WebSocket: request-status-update received:', data);
        this.eventsSubject.next({ type: 'join-request-update', data });
      });
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnectedSubject.next(false);
    }
  }

  /**
   * Join mess-specific room for updates
   */
  joinMessRoom(messId: string): void {
    if (this.socket && this.isConnectedSubject.value) {
      this.socket.emit('join-mess-room', { messId });
    }
  }

  /**
   * Leave mess room
   */
  leaveMessRoom(messId: string): void {
    if (this.socket && this.isConnectedSubject.value) {
      this.socket.emit('leave-mess-room', { messId });
    }
  }

  /**
   * Subscribe to join request status updates
   */
  subscribeToRequestStatus(): void {
    if (this.socket && this.isConnectedSubject.value) {
      this.socket.emit('subscribe-request-status');
    }
  }

  /**
   * Unsubscribe from join request status updates
   */
  unsubscribeFromRequestStatus(): void {
    if (this.socket && this.isConnectedSubject.value) {
      this.socket.emit('unsubscribe-request-status');
    }
  }

  /**
   * Get connection status
   */
  get isConnected(): boolean {
    return this.isConnectedSubject.value;
  }

  /**
   * Emit custom event
   */
  emit(event: string, data?: any): void {
    if (this.socket && this.isConnectedSubject.value) {
      this.socket.emit(event, data);
    }
  }

  /**
   * Listen to custom event
   */
  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}
