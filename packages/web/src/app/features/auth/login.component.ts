import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth.service';
import { AuthStore } from '../../core/auth.store';
import { HTTP_STATUS } from '@app001/shared';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="login-wrapper">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Admin Dashboard — Login</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" type="password" />
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="full-width"
              [disabled]="form.invalid || loading"
            >
              {{ loading ? 'Logging in…' : 'Login' }}
            </button>
          </form>

          <p class="signup-link">
            Don't have an account? <a routerLink="/signup">Sign Up</a>
          </p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .login-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: #f5f5f5;
    }
    .login-card {
      width: 400px;
      padding: 24px;
    }
    .full-width {
      width: 100%;
    }
    mat-form-field {
      margin-bottom: 8px;
    }
    .signup-link {
      text-align: center;
      margin-top: 16px;
    }
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loading = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;

    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.authStore.setUser(res.data.user);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const message = err.status === HTTP_STATUS.UNAUTHORIZED
          ? err.error?.error?.message ?? 'Invalid email or password'
          : `Error ${err.status}: ${err.error?.error?.message ?? 'Something went wrong'}`;
        this.snackBar.open(message, 'Close', { duration: 3000 });
      },
    });
  }
}
