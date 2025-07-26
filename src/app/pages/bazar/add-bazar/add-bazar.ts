import { Component, DestroyRef, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormField } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';
import { Api } from '../../../core/api';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-bazar',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatButton,
    MatInputModule,
    MatDatepickerModule,
    CommonModule,
    MatSelectModule
  ],
  templateUrl: './add-bazar.html',
  styleUrl: './add-bazar.css'
})
export class AddBazar {
  bazarForm: FormGroup;
  loading = false;
  members: any[] = [];

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private dialogRef: MatDialogRef<AddBazar>,
    private destroyRef: DestroyRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.members = data;

    this.bazarForm = this.fb.group({
      date: [new Date(), Validators.required],
      cost: [null, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      members: [[], Validators.required], // Multi-select
    });
  }

  onSubmit(): void {
    if (this.bazarForm.invalid) {
      Swal.fire('Error', 'Please fill out all fields.', 'error');
      return;
    }

    this.loading = true;

    const formData = {
      ...this.bazarForm.value,
      members: this.bazarForm.value.members.map((id: string) => id), // Ensure only IDs sent
    };

    this.api.addBazar(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading = false;
          Swal.fire('Success', 'Bazar added successfully!', 'success')
            .then(() => this.dialogRef.close(true));
        },
        error: () => {
          this.loading = false;
          Swal.fire('Error', 'Failed to add bazar. Try again.', 'error');
        }
      });
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
