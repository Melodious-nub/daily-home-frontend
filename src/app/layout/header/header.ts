import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { HeaderService, HeaderConfig } from '../../core/services/header.service';
import { Auth, User } from '../../core/services/auth';
import { UserStateService } from '../../core/services/user-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Observables
  headerConfig$: Observable<HeaderConfig>;
  currentUser$: Observable<User | null>;
  
  // Component state
  isMenuOpen = false;
  isDropdownOpen = false;

  constructor(
    private headerService: HeaderService,
    private auth: Auth,
    private router: Router,
    private userStateService: UserStateService
  ) {
    this.headerConfig$ = this.headerService.headerConfig$;
    this.currentUser$ = this.auth.currentUser$;
  }

  ngOnInit(): void {
    // Component initialization completed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Toggle dropdown menu visibility
   */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Close dropdown menu
   */
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  /**
   * Handle clicks outside dropdown to close it
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.profile-dropdown');
    const trigger = target.closest('.profile-menu-trigger');
    
    if (!dropdown && !trigger && this.isDropdownOpen) {
      this.closeDropdown();
    }
  }

  /**
   * Get user role string
   */
  getUserRole(): string {
    const userState = this.userStateService.currentUserState;
    return userState?.isMessAdmin ? 'Admin' : 'Member';
  }

  /**
   * Handle profile button click
   */
  onProfileClick(): void {
    // TODO: Navigate to profile page or open profile dialog
    console.log('Profile clicked');
    this.closeDropdown();
    // Example: this.router.navigate(['/profile']);
  }

  /**
   * Handle change password button click
   */
  onChangePasswordClick(): void {
    // TODO: Navigate to change password page or open dialog
    console.log('Change password clicked');
    this.closeDropdown();
    // Example: this.router.navigate(['/change-password']);
  }

  onMessClick(): void {
    // TODO: Navigate to mess management page or open dialog
    console.log('Mess clicked');
    this.closeDropdown();
    // Example: this.router.navigate(['/mess-management']);
  }

  /**
   * Handle logout button click
   */
  onLogoutClick(): void {
    // Close any open dropdowns
    this.closeDropdown();
    // Perform logout
    this.auth.logout();
  }

  /**
   * Close menu programmatically
   */
  closeMenu(): void {
    this.isMenuOpen = false;
  }
}