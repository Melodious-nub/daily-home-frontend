import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join-mess',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './join-mess.html',
  styleUrl: './join-mess.css'
})
export class JoinMess {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/landing']);
  }
} 