import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { Api } from '../../core/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';

interface MessData {
  name: string;
  address: string;
  members: Array<{ email: string }>;
  fixedCosts: Array<{
    name: string;
    amount: number;
    type: string;
    description: string;
  }>;
  bazarIsDeposit: boolean;
}

interface FixedCost {
  name: string;
  amount: number;
  type: string;
  description: string;
}

@Component({
  selector: 'app-create-mess',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-mess.html',
  styleUrl: './create-mess.css'
})
export class CreateMess implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  // Step management
  currentStep: number = 1;
  totalSteps: number = 4;

  // Form data
  messData: MessData = {
    name: '',
    address: '',
    members: [],
    fixedCosts: [],
    bazarIsDeposit: false
  };

  // Step 2: Add Members
  newMemberEmail: string = '';
  emailError: string = '';

  // Step 3: Fixed Costs
  defaultFixedCosts: FixedCost[] = [
    { name: 'House Rent', amount: 0, type: 'houseRent', description: 'Monthly house rent' },
    { name: 'Maid/Helper cost', amount: 0, type: 'maidCost', description: 'Maid or helper expenses' },
    { name: 'Utilities', amount: 0, type: 'utilities', description: 'Electricity, water, gas bills' }
  ];
  customCosts: FixedCost[] = [];

  // Step 4: Confirmation
  generatedCode: string = '';
  inviteLink: string = '';

  // UI state
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private auth: Auth,
    private api: Api
  ) {}

  ngOnInit(): void {
    this.generateMessCode();
    this.generateInviteLink();
  }

  ngOnDestroy(): void {
    // Cleanup handled by takeUntilDestroyed
  }

  // Navigation methods
  goBack(): void {
    if (this.currentStep === 1) {
      this.router.navigate(['/landing']);
    } else {
      this.previousStep();
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.generateInviteLink(); // Update invite link when moving to step 4
    }
  }

  skipStep(): void {
    if (this.currentStep === 2) {
      // Skip adding members
      this.currentStep = 3;
    } else if (this.currentStep === 3) {
      // Skip fixed costs
      this.currentStep = 4;
      this.generateInviteLink();
    }
  }

  // Step 2: Add Members
  addMember(): void {
    if (!this.newMemberEmail || !this.isValidEmail(this.newMemberEmail)) {
      this.emailError = 'Please enter a valid email address';
      return;
    }

    // Check if email already exists
    const existingMember = this.messData.members.find(member => member.email === this.newMemberEmail);
    if (existingMember) {
      this.emailError = 'This email is already added';
      return;
    }

    // Add member
    this.messData.members.push({ email: this.newMemberEmail });
    this.newMemberEmail = '';
    this.emailError = '';
  }

  removeMember(index: number): void {
    this.messData.members.splice(index, 1);
  }

  validateEmailOnBlur(): void {
    if (this.newMemberEmail) {
      this.validateEmail(this.newMemberEmail);
    } else {
      this.emailError = '';
    }
  }

  validateEmail(email: string): void {
    if (!this.isValidEmail(email)) {
      this.emailError = 'Please enter a valid email address';
      return;
    }

    this.api.validateEmail({ email }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response: any) => {
        if (response && response.isValid === false) {
          this.emailError = response.message || 'Invalid email address';
          return;
        }
        this.emailError = '';
      },
      error: (error) => {
        this.emailError = error.error?.message || 'Invalid email address';
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check if email is valid for adding
  isEmailValidForAdding(): boolean {
    return this.newMemberEmail.trim() !== '' && 
           this.isValidEmail(this.newMemberEmail) && 
           this.emailError === '' && 
           !this.messData.members.some(member => member.email === this.newMemberEmail);
  }

  // Step 3: Fixed Costs
  addCustomCost(): void {
    this.customCosts.push({
      name: '',
      amount: 0,
      type: 'custom',
      description: 'Custom cost'
    });
  }

  removeCustomCost(index: number): void {
    this.customCosts.splice(index, 1);
  }

  // Step 4: Confirmation & Create
  generateMessCode(): void {
    // Generate a random 6-digit code
    this.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateInviteLink(): void {
    this.inviteLink = `https://dailyhome.app/join?code=${this.generatedCode}`;
  }

  copyInviteLink(): void {
    navigator.clipboard.writeText(this.inviteLink).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Link Copied!',
        text: 'Invite link has been copied to clipboard',
        timer: 2000,
        showConfirmButton: false
      });
    }).catch(() => {
      Swal.fire({
        icon: 'error',
        title: 'Copy Failed',
        text: 'Failed to copy link to clipboard'
      });
    });
  }

  createMess(): void {
    if (!this.messData.name || !this.messData.address) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all required fields'
      });
      return;
    }

    this.isLoading = true;

    // Prepare fixed costs data
    const allFixedCosts = [
      ...this.defaultFixedCosts.filter(cost => cost.amount > 0),
      ...this.customCosts.filter(cost => cost.name && cost.amount > 0)
    ];

    const createMessData = {
      name: this.messData.name,
      address: this.messData.address,
      members: this.messData.members,
      fixedCosts: allFixedCosts,
      bazarIsDeposit: this.messData.bazarIsDeposit
    };

    // console.log(createMessData);

    this.api.createMess(createMessData).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Mess Created!',
          text: 'Your mess has been created successfully',
          confirmButtonText: 'Continue'
        }).then(() => {
          // Navigate to dashboard or refresh user state
          this.router.navigate(['/main/dashboard']);
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating mess:', error);
        Swal.fire({
          icon: 'error',
          title: 'Creation Failed',
          text: error.error?.message || 'Failed to create mess. Please try again.'
        });
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }
} 