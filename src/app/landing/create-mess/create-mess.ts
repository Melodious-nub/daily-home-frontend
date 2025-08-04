import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-mess',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-mess.html',
  styleUrl: './create-mess.css'
})
export class CreateMess {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/landing']);
  }
} 