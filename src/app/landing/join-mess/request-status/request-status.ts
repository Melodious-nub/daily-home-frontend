import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-request-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './request-status.html',
  styleUrl: './request-status.css'
})
export class RequestStatus {
  mess: any;
  constructor(private router: Router) {
    // Get navigation state if provided
    const nav = this.router.getCurrentNavigation();
    this.mess = nav?.extras?.state || null;
  }

  goBack(): void {
    this.router.navigate(['/landing/join-mess']);
  }
}
