import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Api } from '../../../core/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-member',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './add-member.html',
  styleUrl: './add-member.css'
})
export class AddMember implements OnInit {
  form: FormGroup;
  rooms: any[] = [];
  loading = false;
  preview: string | ArrayBuffer | null = null; // for image preview
  pictureBase64: string = ''; // final picture data to send

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private dialogRef: MatDialogRef<AddMember>,
    private destroyRef: DestroyRef
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      room: ['', Validators.required]
      // picture will be appended manually during submit
    });
  }

  ngOnInit(): void {
    this.api.getRooms()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.rooms = res,
        error: () => {
          Swal.fire('Error', 'Failed to load rooms.', 'error');
          this.dialogRef.close();
        }
      });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.pictureBase64 = reader.result as string;
        this.preview = this.pictureBase64;
      };
      reader.readAsDataURL(file);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      Swal.fire('Error', 'Please fill out all fields.', 'error');
      return;
    }

    this.loading = true;

    const data = {
      ...this.form.value,
      picture: this.pictureBase64 // add picture here
    };

    this.api.addMember(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading = false;
          Swal.fire('Success', 'Member added successfully!', 'success').then(() => {
            this.dialogRef.close(true);
          });
        },
        error: () => {
          this.loading = false;
          Swal.fire('Error', 'Failed to add member. Try again.', 'error');
        }
      });
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
