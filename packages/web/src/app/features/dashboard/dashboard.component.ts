import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UiPageShellComponent } from '@app001/ui';
import type { ApiResponse, PaginatedResponse, User, DocumentModelListItem } from '@app001/shared';
import { PageHeaderService } from '../../core/page-header.service';
import { DocumentModelService } from '../../core/document-model.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, UiPageShellComponent],
  template: `
    <ui-page-shell>
      <div class="stats-grid">
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>people</mat-icon>
            <mat-card-title>Total Users</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="stat-value">{{ totalUsers() }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>description</mat-icon>
            <mat-card-title>Document Models</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="stat-value">{{ totalDocuments() }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>folder</mat-icon>
            <mat-card-title>Categories</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="stat-value">{{ totalCategories() }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>label</mat-icon>
            <mat-card-title>Tags</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="stat-value">{{ totalTags() }}</p>
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
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private pageHeader = inject(PageHeaderService);
  private documentService = inject(DocumentModelService);

  totalUsers = signal(0);
  totalDocuments = signal(0);
  totalCategories = signal(0);
  totalTags = signal(0);

  ngOnInit() {
    this.pageHeader.set({ title: 'Dashboard', subtitle: 'Overview of your application' });

    forkJoin({
      users: this.http.get<ApiResponse<PaginatedResponse<User>>>('/api/users?page=1&pageSize=1'),
      documents: this.http.get<ApiResponse<PaginatedResponse<DocumentModelListItem>>>('/api/document-models?page=1&pageSize=1'),
      categories: this.documentService.listCategories(),
      tags: this.documentService.listTags(),
    }).subscribe((res) => {
      if (res.users.success && res.users.data) this.totalUsers.set(res.users.data.total);
      if (res.documents.success && res.documents.data) this.totalDocuments.set(res.documents.data.total);
      if (res.categories.success && res.categories.data) this.totalCategories.set(res.categories.data.length);
      if (res.tags.success && res.tags.data) this.totalTags.set(res.tags.data.length);
    });
  }
}
