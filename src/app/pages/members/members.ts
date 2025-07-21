import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { Api } from '../../core/api';

@Component({
  selector: 'app-members',
  imports: [
    CommonModule
  ],
  templateUrl: './members.html',
  styleUrl: './members.css'
})
export class Members implements OnInit {
  members: any = [];

  constructor(private destroyRef: DestroyRef, private api: Api) {}

  ngOnInit(): void {
    
  }

  fetchMember() {
    
  }

  openAddMemberModal() {}

}
