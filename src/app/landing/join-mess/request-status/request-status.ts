import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserStateService } from '../../../core/services/user-state.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-request-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './request-status.html',
  styleUrl: './request-status.css'
})
export class RequestStatus implements OnInit, OnDestroy {
  mess: any;
  requestStatus: any = null;
  isLoading: boolean = true;
  isProcessingUpdate: boolean = false;
  processingMessage: string = '';
  processingIcon: string = '';
  private destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private userStateService: UserStateService,
    private webSocketService: WebSocketService
  ) {
    // Get navigation state if provided
    const nav = this.router.getCurrentNavigation();
    this.mess = nav?.extras?.state || null;
  }

  ngOnInit(): void {
    // Get initial request status
    this.loadRequestStatus();
    // Setup WebSocket listeners for real-time updates
    this.setupWebSocketListeners();
    // Connect to WebSocket for real-time updates
    this.connectWebSocket();
    // Start periodic status check as fallback
    this.startPeriodicStatusCheck();
  }

  private loadRequestStatus(): void {
    // Load initial request status
    this.userStateService['api'].checkRequestStatus().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response: any) => {
        this.requestStatus = response;
        this.isLoading = false;
        
        // If status is not pending, handle the update
        if (response.status && response.status !== 'pending') {
          this.handleRequestStatusUpdate(response);
        }
      },
      error: (error: any) => {
        console.error('Error loading request status:', error);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Stop WebSocket connection when component is destroyed
    this.webSocketService.unsubscribeFromRequestStatus();
    this.webSocketService.disconnect();
  }

  private setupWebSocketListeners(): void {
    // Subscribe to WebSocket events
    this.webSocketService.events$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event) => {
      this.handleWebSocketEvent(event);
    });
  }

  private handleWebSocketEvent(event: any): void {
    if (event.type === 'join-request-update') {
      this.handleRequestStatusUpdate(event.data);
    }
  }

  private connectWebSocket(): void {
    const token = localStorage.getItem('token') || undefined;
    this.webSocketService.connect(token).then(() => {
      console.log('WebSocket connected for request status updates');
      this.webSocketService.subscribeToRequestStatus();
    }).catch((error) => {
      console.error('Failed to connect WebSocket:', error);
    });
  }

  private startPeriodicStatusCheck(): void {
    // Check status every 30 seconds as fallback
    interval(30000).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      if (!this.isProcessingUpdate) {
        this.userStateService['api'].checkRequestStatus().pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe({
          next: (response: any) => {
            if (response.status && response.status !== 'pending') {
              this.handleRequestStatusUpdate(response);
            }
          },
          error: (error: any) => {
            console.error('Error in periodic status check:', error);
          }
        });
      }
    });
  }

  private handleRequestStatusUpdate(data: any): void {
    console.log('WebSocket request status update:', data);
    
    // Show processing screen
    this.isProcessingUpdate = true;
    
    // Handle different status updates
    switch (data.status) {
      case 'accepted':
        console.log('Request accepted via WebSocket');
        this.processingIcon = 'fa-check-circle';
        this.processingMessage = 'Request accepted! Redirecting to dashboard...';
        // Show success message and redirect to dashboard with minimum 3 second delay
        setTimeout(() => {
          this.userStateService.refreshUserState();
        }, 3000);
        break;
      case 'rejected':
        console.log('Request rejected via WebSocket');
        this.processingIcon = 'fa-times-circle';
        this.processingMessage = 'Request rejected. Redirecting to landing page...';
        // Show rejection message and redirect to landing with minimum 3 second delay
        setTimeout(() => {
          this.userStateService.refreshUserState();
        }, 3000);
        break;
      case 'pending':
        // Continue showing current status
        this.isProcessingUpdate = false;
        break;
      case 'none':
        console.log('No request found via WebSocket');
        this.processingIcon = 'fa-info-circle';
        this.processingMessage = 'No request found. Redirecting to landing page...';
        // Redirect to landing with minimum 3 second delay
        setTimeout(() => {
          this.userStateService.refreshUserState();
        }, 3000);
        break;
    }
  }

  goBack(): void {
    // Cancel the join request
    Swal.fire({
      title: 'Cancel Request?',
      text: 'Are you sure you want to cancel your join request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userStateService.cancelJoinRequest().pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe({
          next: () => {
            Swal.fire('Cancelled!', 'Your join request has been cancelled.', 'success');
            // Disconnect WebSocket and let UserStateService handle the routing
            this.webSocketService.unsubscribeFromRequestStatus();
            this.webSocketService.disconnect();
            // Add 3 second delay before UserStateService handles the routing
            setTimeout(() => {
              // UserStateService will handle the routing after cancellation
            }, 3000);
          },
          error: (error: any) => {
            console.error('Error canceling request:', error);
            Swal.fire('Error', 'Failed to cancel request. Please try again.', 'error');
          }
        });
      }
    });
  }
}
