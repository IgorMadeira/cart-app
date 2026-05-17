import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UiPageShellComponent } from '@app001/ui';
import type { ApiResponse, User } from '@app001/shared';
import { PageHeaderService } from '../../core/page-header.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    UiPageShellComponent,
  ],
  template: `
    <ui-page-shell>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-card>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" />
              @if (form.controls.name.hasError('required')) {
                <mat-error>Name is required</mat-error>
              }
              @if (form.controls.name.hasError('minlength')) {
                <mat-error>Name must be at least 2 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" />
              @if (form.controls.email.hasError('required')) {
                <mat-error>Email is required</mat-error>
              }
              @if (form.controls.email.hasError('email')) {
                <mat-error>Invalid email address</mat-error>
              }
            </mat-form-field>

            @if (!isEdit) {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input matInput formControlName="password" type="password" />
                @if (form.controls.password.hasError('required')) {
                  <mat-error>Password is required</mat-error>
                }
                @if (form.controls.password.hasError('minlength')) {
                  <mat-error>Password must be at least 8 characters</mat-error>
                }
              </mat-form-field>
            }

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Role</mat-label>
              <mat-select formControlName="role">
                <mat-option value="viewer">Viewer</mat-option>
                <mat-option value="editor">Editor</mat-option>
                <mat-option value="admin">Admin</mat-option>
              </mat-select>
            </mat-form-field>
          </mat-card-content>

          <mat-card-actions align="end">
            <button mat-button type="button" (click)="cancel()">Cancel</button>
            <button
              mat-flat-button
              color="primary"
              type="submit"
              [disabled]="form.invalid || loading"
            >
              {{ loading ? 'Saving…' : (isEdit ? 'Update' : 'Create') }}
            </button>
          </mat-card-actions>
        </mat-card>
      </form>
    </ui-page-shell>
  `,
  styles: `
    .full-width {
      width: 100%;
    }
    mat-form-field {
      margin-bottom: 8px;
    }
    mat-card {
      max-width: 600px;
    }
    mat-card-content {
      display: flex;
      flex-direction: column;
    }
  `,
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private pageHeader = inject(PageHeaderService);

  loading = false;
  isEdit = false;
  userId = '';

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['viewer'],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.userId = id;
      this.form.controls.password.clearValidators();
      this.form.controls.password.updateValueAndValidity();
      this.loadUser(id);
    }
    this.pageHeader.set({
      title: this.isEdit ? 'Edit User' : 'New User',
      subtitle: 'Fill in user details',
      showBack: true,
      backRoute: '/users',
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;

    const values = this.form.getRawValue();

    if (this.isEdit) {
      const body: Record<string, string> = {};
      if (values.name) body['name'] = values.name;
      if (values.email) body['email'] = values.email;
      if (values.role) body['role'] = values.role;

      this.http.patch<ApiResponse<User>>(`/api/users/${this.userId}`, body).subscribe({
        next: (res) => {
          if (res.success) {
            this.snackBar.open('User updated', 'Close', { duration: 3000 });
            this.router.navigate(['/users']);
          }
        },
        error: (err) => {
          this.loading = false;
          const message = err.error?.error?.message ?? 'Failed to update user';
          this.snackBar.open(message, 'Close', { duration: 3000 });
        },
      });
    } else {
      this.http.post<ApiResponse<User>>('/api/users', values).subscribe({
        next: (res) => {
          if (res.success) {
            this.snackBar.open('User created', 'Close', { duration: 3000 });
            this.router.navigate(['/users']);
          }
        },
        error: (err) => {
          this.loading = false;
          const message = err.error?.error?.message ?? 'Failed to create user';
          this.snackBar.open(message, 'Close', { duration: 3000 });
        },
      });
    }
  }

  cancel() {
    this.router.navigate(['/users']);
  }

  private loadUser(id: string) {
    this.http.get<ApiResponse<User>>(`/api/users/${id}`).subscribe((res) => {
      if (res.success && res.data) {
        this.form.patchValue({
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
        });
      }
    });
  }
}
