import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Api } from '../../../core/api';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-add-meals',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatButton,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    CommonModule
  ],
  templateUrl: './add-meals.html',
  styleUrl: './add-meals.css'
})
export class AddMeals {
  mealsForm: FormGroup;
  loading = false;
  members: any = [];

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private dialogRef: MatDialogRef<AddMeals>,
    private destroyRef: DestroyRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.members = data;
    
    this.mealsForm = this.fb.group({
      date: [new Date(), Validators.required],
      member: [null, Validators.required], // ✅ added member field
      meals: [null, [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit(): void {
    if (this.mealsForm.invalid) {
      Swal.fire('Error', 'Please fill out all fields.', 'error');
      return;
    }

    this.loading = true;

    const formData = this.mealsForm.value;

    this.api.addMeals(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading = false;
          Swal.fire('Success', 'Meal added successfully!', 'success')
            .then(() => this.dialogRef.close(true));
        },
        error: () => {
          this.loading = false;
          Swal.fire('Error', 'Failed to add meal. Try again.', 'error');
        }
      });
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
