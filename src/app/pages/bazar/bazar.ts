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
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
    MatTooltipModule,
    MatMenuModule,
    MatCheckboxModule
  ],
  templateUrl: './bazar.html',
  styleUrl: './bazar.css'
})
export class Bazar implements OnInit {
  displayedColumns: any[] = ['date', 'members', 'cost', 'description', 'actions'];
  dataSource = new MatTableDataSource<any[]>();
  isLoading = false;
  members: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private api: Api,
    private dialog: MatDialog,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.fetchBazar();
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

  selectedMemberIds: string[] = [];
  allBazars: any[] = [];

  fetchBazar(): void {
    this.isLoading = true;
    this.api.getBazar()
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.allBazars = res;
          this.applyFilter();
        },
        error: () => {
          this.isLoading = false;
          Swal.fire('Error', 'Failed to load bazar list.', 'error');
        },
      });
  }

  getMemberById(id: string): any {
    return this.members.find(m => m._id === id);
  }

  applyFilter(): void {
    const filtered = this.selectedMemberIds.length === 0
      ? this.allBazars
      : this.allBazars.filter(item =>
          item.members?.some((m: any) => this.selectedMemberIds.includes(m._id))
        );

    this.dataSource = new MatTableDataSource(filtered);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  toggleMemberSelection(memberId: string): void {
    if (this.selectedMemberIds.includes(memberId)) {
      this.selectedMemberIds = this.selectedMemberIds.filter(id => id !== memberId);
    } else {
      this.selectedMemberIds.push(memberId);
    }
    this.applyFilter();
  }

  clearMemberFilter(): void {
    this.selectedMemberIds = [];
    this.applyFilter();
  }

  openAddBazarModal(): void {
    const dialogRef = this.dialog.open(AddBazar, {
      width: '400px',
      disableClose: true,
      data: this.members
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

  showTooltip(tooltip: MatTooltip) {
    tooltip.show();
    setTimeout(() => tooltip.hide(), 2500); // Hide after 2.5s
  }  
}