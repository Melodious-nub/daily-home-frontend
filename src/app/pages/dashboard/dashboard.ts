import { Component, DestroyRef, OnInit } from '@angular/core';
import { Api } from '../../core/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  monthlySummaryDetails: any = [];
  selectedMonth: number = new Date().getMonth() + 1;
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(private api: Api, private destroyRef: DestroyRef) {}

  ngOnInit(): void {
    // this.fetchMonthlySummary();
  }

  fetchMonthlySummary(): void {
    this.api.getSummary(this.selectedMonth)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.monthlySummaryDetails = res;
        },
        error: () => {
          Swal.fire('Error', 'Failed to load summary.', 'error');
        }
      });
  }

  changeMonth(month: number): void {
    this.selectedMonth = month;
    this.fetchMonthlySummary();
  }
}
