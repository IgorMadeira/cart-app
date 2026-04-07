import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UiPageShellComponent } from '@app001/ui';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, UiPageShellComponent],
  template: `
    <ui-page-shell title="Dashboard" subtitle="Overview of your application">
      <div class="stats-grid">
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>people</mat-icon>
            <mat-card-title>Total Users</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="stat-value">128</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>trending_up</mat-icon>
            <mat-card-title>Active Sessions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="stat-value">42</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>event</mat-icon>
            <mat-card-title>Events Today</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="stat-value">7</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>storage</mat-icon>
            <mat-card-title>DB Size</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="stat-value">1.2 MB</p>
          </mat-card-content>
        </mat-card>
      </div>
    </ui-page-shell>
  `,
  styles: `
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 500;
      margin: 16px 0 0;
    }
  `,
})
export class DashboardComponent {}
