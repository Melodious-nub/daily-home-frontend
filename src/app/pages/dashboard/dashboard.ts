import { Component, DestroyRef, OnInit } from '@angular/core';
import { Api } from '../../core/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardModule,
    MatMenuModule,
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

  constructor(private api: Api, private destroyRef: DestroyRef, private auth: Auth) {}

  ngOnInit(): void {
    this.fetchMonthlySummary();
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

  logout(): void {
    this.auth.logout();
  }
}
