import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { Api } from '../../core/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import Swal from 'sweetalert2';

interface MessData {
  name: string;
  address: string;
  members: Array<{ email: string }>;
  fixedCosts: Array<{
    name: string;
    amount: number;
  }>;
  bazarIsDeposit: boolean;
}

interface FixedCost {
  name: string;
  amount: number;
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
  isEmailValidating: boolean = false;
  isEmailValidated: boolean = false;
  private emailValidationSubject = new Subject<string>();

  // Step 3: Fixed Costs
  defaultFixedCosts: FixedCost[] = [
    { name: 'House Rent', amount: 0 },
    { name: 'Maid/Helper cost', amount: 0 },
    { name: 'Utilities', amount: 0 }
  ];
  customCosts: FixedCost[] = [];

  // Step 4: Confirmation

  // UI state
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private auth: Auth,
    private api: Api
  ) {}

  ngOnInit(): void {
    this.setupEmailValidation();
  }

  ngOnDestroy(): void {
    // Cleanup handled by takeUntilDestroyed
    this.emailValidationSubject.complete();
  }

  // Setup debounced email validation
  private setupEmailValidation(): void {
    this.emailValidationSubject.pipe(
      debounceTime(1800), // 500ms delay
      distinctUntilChanged(), // Only validate if email actually changed
      switchMap(email => {
        if (!email || !this.isValidEmail(email)) {
          this.emailError = email ? 'Please enter a valid email address' : '';
          this.isEmailValidated = false;
          this.isEmailValidating = false;
          return [];
        }
        
        this.isEmailValidating = true;
        this.emailError = '';
        this.isEmailValidated = false;
        
        return this.api.validateEmail({ email });
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response: any) => {
        this.isEmailValidating = false;
        if (response && response.isValid === false) {
          this.emailError = response.message || 'Invalid email address';
          this.isEmailValidated = false;
          return;
        }
        this.emailError = '';
        this.isEmailValidated = true;
      },
      error: (error) => {
        this.isEmailValidating = false;
        this.emailError = error.error?.message || 'Invalid email address';
        this.isEmailValidated = false;
      }
    });
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
    }
  }

  skipStep(): void {
    if (this.currentStep === 2) {
      // Skip adding members
      this.currentStep = 3;
    } else if (this.currentStep === 3) {
      // Skip fixed costs
      this.currentStep = 4;
    }
  }

  // Step 2: Add Members
  addMember(): void {
    if (!this.isEmailValidForAdding()) {
      return;
    }

    // Add member
    this.messData.members.push({ email: this.newMemberEmail });
    this.newMemberEmail = '';
    this.emailError = '';
    this.isEmailValidated = false;
  }

  removeMember(index: number): void {
    this.messData.members.splice(index, 1);
  }

  // Trigger email validation on input change
  onEmailInputChange(): void {
    this.emailValidationSubject.next(this.newMemberEmail);
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
           this.isEmailValidated && 
           !this.isEmailValidating &&
           !this.messData.members.some(member => member.email === this.newMemberEmail);
  }

  // Step 3: Fixed Costs
  addCustomCost(): void {
    this.customCosts.push({
      name: '',
      amount: 0
    });
  }

  removeCustomCost(index: number): void {
    this.customCosts.splice(index, 1);
  }

  // Get all fixed costs (default + custom)
  getTotalFixedCosts(): FixedCost[] {
    return [
      ...this.defaultFixedCosts.filter(cost => cost.amount > 0),
      ...this.customCosts.filter(cost => cost.name && cost.amount > 0)
    ];
  }

  // Get members as comma-separated text
  getMembersAsText(): string {
    return this.messData.members.map(member => member.email).join(', ');
  }

  // Get costs as comma-separated text
  getCostsAsText(): string {
    return this.getTotalFixedCosts().map(cost => `${cost.name}: ৳${cost.amount}`).join(', ');
  }

  // Step 4: Confirmation & Create

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
          text: `Your mess has been created successfully! Mess Code: ${response.mess.identifierCode}`,
          confirmButtonText: 'Continue',
          allowOutsideClick: false,
          backdrop: false
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