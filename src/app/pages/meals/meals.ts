import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Api } from '../../core/api';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import Swal from 'sweetalert2';
import { AddMeals } from './add-meals/add-meals';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-meals',
  imports: [
    MatTableModule,
    CommonModule,
    MatSortModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatIconModule,
    MatPaginator,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './meals.html',
  styleUrl: './meals.css'
})
export class Meals implements OnInit {
  displayedColumns: any[] = ['date', 'name', 'meals', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  allMeals: any[] = []; // Full unfiltered data
  isLoading = false;

  members: any[] = [];
  filterMemberId: string | null = null; // Selected filter member ID

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: Api,
    private dialog: MatDialog,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.fetchMeals();
    this.fetchMember();
  }

  fetchMember(): void {
    this.api.getMembers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.members = res;
        },
        error: () => {
          Swal.fire('Error', 'Failed to load members. Try again.', 'error');
        }
      });
  }

  fetchMeals(): void {
    this.isLoading = true;
    this.api.getMeals()
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.allMeals = res.slice().reverse(); // Keep original order reversed
          this.applyFilter(); // Apply filter if already selected
        },
        error: () => {
          this.isLoading = false;
          Swal.fire('Error', 'Failed to load meals list.', 'error');
        },
      });
  }

  applyFilter(): void {
    const filteredMeals = this.filterMemberId
      ? this.allMeals.filter(meal => meal.member._id === this.filterMemberId)
      : this.allMeals;

    this.dataSource = new MatTableDataSource(filteredMeals);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openAddMealModal(): void {
    const dialogRef = this.dialog.open(AddMeals, {
      width: '400px',
      disableClose: true,
      data: this.members
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res === true) {
        this.fetchMeals();
      }
    });
  }

  deleteMeal(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This Meal entry will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.deleteMeal(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              Swal.fire('Deleted!', 'Meal entry deleted.', 'success');
              this.fetchMeals();
            },
            error: () => {
              Swal.fire('Error', 'Failed to delete', 'error');
            }
          });
      }
    });
  }
}
