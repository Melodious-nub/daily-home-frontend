import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Auth } from '../core/services/auth';
import { filter, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { Subject, combineLatest } from 'rxjs';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing implements OnInit, OnDestroy, AfterViewInit {
  currentUser: any = null;
  selectedOption: 'create' | 'join' | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private auth: Auth,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    // Get current user
    this.auth.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Listen to route changes to reset selection when returning to landing
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      if (event.url === '/landing') {
        // console.log('Returned to landing page, resetting selection');
        this.resetSelection();
        // Defer change detection to avoid assertion error
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      }
    });

    // Also listen to route data changes as a backup
    this.route.data.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // console.log('Route data changed, ensuring selection is reset');
      this.resetSelection();
      // Defer change detection to avoid assertion error
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    });
  }

  ngOnInit(): void {
    // Reset selection when component initializes
    this.resetSelection();
    
    // Additional check: reset selection after a short delay to handle gesture navigation
    setTimeout(() => {
      this.resetSelection();
      this.cdr.detectChanges();
    }, 100);

    // Another check after a longer delay to catch any late gesture navigation
    setTimeout(() => {
      this.resetSelection();
      this.cdr.detectChanges();
    }, 500);
  }

  ngAfterViewInit(): void {
    // Additional check after view is initialized
    setTimeout(() => {
      this.resetSelection();
      this.cdr.detectChanges();
    }, 200);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetSelection(): void {
    // console.log('Resetting selection state');
    this.selectedOption = null;
  }

  selectOption(option: 'create' | 'join'): void {
    // console.log('Selecting option:', option);
    this.selectedOption = option;
    // Defer change detection to avoid assertion error
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
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