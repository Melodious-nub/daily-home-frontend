import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ViewChild } from '@angular/core';
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
import { debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';
import { AddWallet } from './add-wallet/add-wallet';

@Component({
  selector: 'app-wallet',
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
  templateUrl: './wallet.html',
  styleUrl: './wallet.css'
})
export class Wallet {
  displayedColumns: any[] = ['date', 'picture', 'name', 'amount', 'actions'];
  dataSource = new MatTableDataSource<any[]>();
  isLoading = false;
  members: any = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: Api,
    private dialog: MatDialog,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.fetchWallet();
    this.fetchMember();
  }

  fetchMember() {
    this.api.getMembers().pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (res) => {
        this.members = res;
      },
      error: () => {
        Swal.fire('Error', 'Failed to load member. Try again.', 'error');
      }
    })
  }  

  fetchWallet(): void {
    this.isLoading = true;
    this.api
      .getWallet()
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.dataSource = new MatTableDataSource(res.slice().reverse());
          // console.log(res);
        },
        error: () => {
          this.isLoading = false;
          Swal.fire('Error', 'Failed to load wallet list.', 'error');
        },
      });
  }

  openAddWalletModal(): void {
    const dialogRef = this.dialog.open(AddWallet, {
      width: '400px',
      disableClose: true,
      data: this.members
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res === true) this.fetchWallet();
    });
  }

  deleteWallet(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This Wallet entry will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
    }).then((result) => {
      if (result.isConfirmed) {
        this.api
          .deleteWallet(id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              Swal.fire('Deleted!', 'Wallet entry deleted.', 'success');
              this.fetchWallet();
            },
            error: () => Swal.fire('Error', 'Failed to delete', 'error'),
          });
      }
    });
  }
}
