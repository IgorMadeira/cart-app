import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../core/auth.service';
import { AuthStore } from '../core/auth.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-sidenav-container class="shell-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <mat-toolbar color="primary">
          <span>App001</span>
        </mat-toolbar>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/users" routerLinkActive="active">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Users</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar>
          <span class="spacer"></span>
          @if (authStore.user(); as user) {
            <span>{{ user.name }}</span>
          }
          <button mat-icon-button (click)="logout()" aria-label="Logout">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>

        <main class="content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .shell-container {
      height: 100vh;
    }
    .sidenav {
      width: 240px;
    }
    .content {
      padding: 24px;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .active {
      background: rgba(0, 0, 0, 0.04);
    }
  `,
})
export class ShellComponent {
  authStore = inject(AuthStore);
  private authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.authStore.logout();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authStore.logout();
        this.router.navigate(['/login']);
      },
    });
  }
}
