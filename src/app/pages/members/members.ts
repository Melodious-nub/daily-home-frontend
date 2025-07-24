import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { Api } from '../../core/api';
import { MatDialog } from '@angular/material/dialog';
import { AddMember } from './add-member/add-member';
import { CdkScrollable, ScrollingModule } from '@angular/cdk/scrolling';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-members',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ScrollingModule
  ],
  templateUrl: './members.html',
  styleUrl: './members.css'
})
export class Members implements OnInit {
  members: any = [];
  loading: boolean = false;

  constructor(private destroyRef: DestroyRef, private api: Api, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchMember();
  }

  fetchMember() {
    this.loading = true;
    const sub = this.api.getMembers()
      .subscribe({
        next: (res) => {
          this.members = res;
          this.loading = false
          // console.log(this.members);
          
        },
        error: (err) => {
          Swal.fire('Error', 'Failed to load members.', 'error');
          console.error(err);
          this.loading = false
        }
      });

    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  openAddMemberModal() {
    const dialogRef = this.dialog.open(AddMember, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res == true) {
        this.fetchMember();
      } 
    });
  }

  onScroll(event: any) {
    const scrollTop = event.getElementRef().nativeElement.scrollTop;

    // Pull-to-refresh: If user is at very top and swipes down
    if (scrollTop <= -40) {
      this.fetchMember();
    }
  }

}
