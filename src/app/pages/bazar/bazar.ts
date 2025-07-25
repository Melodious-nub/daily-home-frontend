import { Component, DestroyRef, OnInit, ViewChild } from '@angular/core';
import { Api } from '../../core/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';
import { debounceTime } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AddBazar } from './add-bazar/add-bazar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-bazar',
  standalone: true,
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
    MatTooltipModule
  ],
  templateUrl: './bazar.html',
  styleUrl: './bazar.css'
})
export class Bazar implements OnInit {
  displayedColumns: any[] = ['date', 'cost', 'description', 'actions'];
  dataSource = new MatTableDataSource<any[]>();
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: Api,
    private dialog: MatDialog,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.fetchBazar();
  }

  fetchBazar(): void {
    this.isLoading = true;
    this.api
      .getBazar()
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res) {
            this.dataSource = new MatTableDataSource(res.slice().reverse());
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          } else {
            this.dataSource = new MatTableDataSource(res);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }
        },
        error: () => {
          this.isLoading = false;
          Swal.fire('Error', 'Failed to load bazar list.', 'error');
        },
      });
  }

  openAddBazarModal(): void {
    const dialogRef = this.dialog.open(AddBazar, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res === true) this.fetchBazar();
    });
  }

  deleteBazar(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This bazar entry will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
    }).then((result) => {
      if (result.isConfirmed) {
        this.api
          .deleteBazar(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              Swal.fire('Deleted!', 'Bazar entry deleted.', 'success');
              this.fetchBazar();
            },
            error: () => Swal.fire('Error', 'Failed to delete', 'error'),
          });
      }
    });
  }
}