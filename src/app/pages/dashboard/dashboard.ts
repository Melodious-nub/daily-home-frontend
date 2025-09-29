import { Component, DestroyRef, OnInit } from '@angular/core';
import { Api } from '../../core/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../core/services/auth';
import { HeaderService } from '../../core/services/header.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardModule,
    MatIconModule,
    CommonModule,
    MatButtonModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  monthlySummaryDetails: any = [];
  selectedMonth: number = new Date().getMonth() + 1;
  todayDate: any = new Date();
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  isLoading: boolean = false;

  constructor(
    private api: Api, 
    private destroyRef: DestroyRef, 
    private auth: Auth,
    private headerService: HeaderService
  ) {}

  ngOnInit(): void {
    this.setupHeader();
    this.fetchMonthlySummary();
  }

  /**
   * Setup header configuration for dashboard
   */
  private setupHeader(): void {
    const userName = this.auth.currentUser?.fullName || 'User';
    this.headerService.setHeaderConfig({
      title: `Hello, ${userName}`,
      subtitle: 'Welcome to DailyHome',
      showBackButton: false,
      showMenuButton: true
    });
  }

  fetchMonthlySummary(): void {
    this.monthlySummaryDetails = [];
    this.isLoading = true;
    this.api.getSummary(this.selectedMonth)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.monthlySummaryDetails = res;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          Swal.fire('Error', 'Failed to load summary.', 'error');
        }
      });
  }

  changeMonth(month: number): void {
    this.selectedMonth = month;
    // console.log(this.selectedMonth);
    this.fetchMonthlySummary();
  }
}
