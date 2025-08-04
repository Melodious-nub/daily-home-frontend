import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../core/services/auth';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {
  currentUser: any = null;
  selectedOption: 'create' | 'join' | null = null;

  constructor(
    private auth: Auth,
    private router: Router
  ) {
    // Get current user
    this.auth.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  selectOption(option: 'create' | 'join'): void {
    this.selectedOption = option;
  }

  next(): void {
    if (this.selectedOption === 'create') {
      this.router.navigate(['/landing/create-mess']);
    } else if (this.selectedOption === 'join') {
      this.router.navigate(['/landing/join-mess']);
    }
  }

  logout(): void {
    this.auth.logout();
  }
} 