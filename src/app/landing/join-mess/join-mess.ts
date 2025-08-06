import { Component, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { Api } from '../../core/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-join-mess',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './join-mess.html',
  styleUrl: './join-mess.css'
})
export class JoinMess {
  messCode: string = '';
  mess: any = null;
  isLoading: boolean = false;
  isSendingRequest: boolean = false;
  hasSearched: boolean = false;

  constructor(private router: Router, private auth: Auth, private api: Api, private destroyRef: DestroyRef) {}

  goBack(): void {
    this.router.navigate(['/landing']);
  }

  onMessCodeInput(): void {
    // Convert to string and ensure it's numeric
    this.messCode = this.messCode.toString().replace(/[^0-9]/g, '');
    
    // Clear result if code is less than 6 characters
    if (this.messCode.length < 6) {
      this.mess = null;
      this.hasSearched = false;
    }
  }

  onEnterKey(): void {
    // Trigger search when Enter key is pressed (mobile "Go" button)
    if (this.messCode.length >= 6 && !this.isLoading) {
      this.searchMess();
    }
  }

  searchMess(): void {
    // Ensure messCode is a string and at least 6 digits
    const code = this.messCode.toString().replace(/[^0-9]/g, '');
    
    if (code.length >= 6) {
      this.isLoading = true;
      this.hasSearched = true;
      this.mess = null;
      
      this.api.getMessWithCode(code).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res) => {
          this.mess = res;
          this.isLoading = false;
        },
        error: (err) => {
          // console.log(err);
          this.mess = null;
          this.isLoading = false;
        }
      });
    } else {
      this.mess = null;
      this.hasSearched = false;
    }
  }

  sendJoinRequest(messId: string): void {
    this.isSendingRequest = true;
    this.api.joinMess({messId: messId}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.isSendingRequest = false;
        // this.router.navigate(['/landing/join-mess']);
      },
      error: (err) => {
        console.log(err);
        this.isSendingRequest = false;
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }
} 