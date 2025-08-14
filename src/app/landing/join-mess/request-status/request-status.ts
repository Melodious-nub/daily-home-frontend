import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserStateService } from '../../../core/services/user-state.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private userStateService: UserStateService
  ) {
    // Get navigation state if provided
    const nav = this.router.getCurrentNavigation();
    this.mess = nav?.extras?.state || null;
  }

  ngOnInit(): void {
    // Get initial request status
    this.loadRequestStatus();
    // Start WebSocket connection for real-time updates
    this.userStateService.startStatusPolling();
  }

  private loadRequestStatus(): void {
    // Load initial request status
    this.userStateService['api'].checkRequestStatus().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response: any) => {
        this.requestStatus = response;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading request status:', error);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Stop WebSocket connection when component is destroyed
    this.userStateService.stopStatusPolling();
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
            // UserStateService will handle the routing after cancellation
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
