import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-create-mess',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-mess.html',
  styleUrl: './create-mess.css'
})
export class CreateMess {
  constructor(private router: Router, private auth: Auth) {}

  goBack(): void {
    this.router.navigate(['/landing']);
  }

  logout(): void {
    this.auth.logout();
  }
} 