import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  UiPageShellComponent,
  UiTableComponent,
  UiConfirmDialogComponent,
  HasPermissionDirective,
  RelativeDatePipe,
  type TableColumn,
  type ConfirmDialogData,
} from '@app001/ui';
import { PERMISSIONS, ROLE_PERMISSIONS } from '@app001/shared';
import type { DocumentModelListItem, Category, Tag } from '@app001/shared';
import { DocumentModelService } from '../../core/document.service';
import { AuthStore } from '../../core/auth.store';
import { CategoryManagementComponent } from './category-management.component';
import { TagManagementComponent } from './tag-management.component';
import type { Role } from '@app001/shared';
import { PageHeaderService } from '../../core/page-header.service';

@Component({
  selector: 'app-document-model-list',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    UiPageShellComponent,
    UiTableComponent,
    HasPermissionDirective,
    RelativeDatePipe,
  ],
  template: `
    <ui-page-shell>
      <ng-container actions>
        <button
          *uiHasPermission="PERMISSIONS.DOCUMENT_MODELS_WRITE; permissions: userPermissions()"
          mat-flat-button
          color="primary"
          (click)="navigateToCreate()"
        >
          <mat-icon>add</mat-icon>
          New Document Model
        </button>
        <button
          *uiHasPermission="PERMISSIONS.CATEGORIES_WRITE; permissions: userPermissions()"
          mat-stroked-button
          (click)="openCategoryManagement()"
        >
          <mat-icon>category</mat-icon>
          Categories
        </button>
        <button
          *uiHasPermission="PERMISSIONS.DOCUMENT_MODELS_WRITE; permissions: userPermissions()"
          mat-stroked-button
          (click)="openTagManagement()"
        >
          <mat-icon>label</mat-icon>
          Tags
        </button>
      </ng-container>

      <div class="filters">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Search</mat-label>
          <input matInput [(ngModel)]="searchQuery" (keyup.enter)="applyFilters()" placeholder="Search documents..." />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Category</mat-label>
          <mat-select [(ngModel)]="selectedCategoryId" (selectionChange)="applyFilters()">
            <mat-option value="">All categories</mat-option>
            @for (cat of categories(); track cat.id) {
              <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Tag</mat-label>
          <mat-select [(ngModel)]="selectedTagId" (selectionChange)="applyFilters()">
            <mat-option value="">All tags</mat-option>
            @for (tag of tags(); track tag.id) {
              <mat-option [value]="tag.id">{{ tag.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <ui-table
        [columns]="columns"
        [data]="documents()"
        [total]="total()"
        [pageSize]="20"
        (pageChange)="onPage($event)"
      >
        <ng-template #cellTpl let-row let-column="column">
          @switch (column) {
            @case ('tags') {
              <mat-chip-set>
                @for (tag of row.tags; track tag.id) {
                  <mat-chip>{{ tag.name }}</mat-chip>
                }
              </mat-chip-set>
            }
            @case ('createdAt') {
              {{ row.createdAt | relativeDate }}
            }
            @case ('actions') {
              <div class="actions-grid">
                <span>
                  @if (row.fileName) {
                    <button mat-icon-button class="action-download" (click)="download(row)" aria-label="Download">
                      <mat-icon>download</mat-icon>
                    </button>
                  }
                </span>
                <button
                  *uiHasPermission="PERMISSIONS.DOCUMENT_MODELS_WRITE; permissions: userPermissions()"
                  mat-icon-button
                  class="action-edit"
                  (click)="navigateToEdit(row.id)"
                  aria-label="Edit"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  *uiHasPermission="PERMISSIONS.DOCUMENT_MODELS_WRITE; permissions: userPermissions()"
                  mat-icon-button
                  class="action-delete"
                  (click)="confirmDelete(row)"
                  aria-label="Delete"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
            @default {
              {{ row[column] }}
            }
          }
        </ng-template>
      </ui-table>
    </ui-page-shell>
  `,
  styles: `
    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .filter-field {
      min-width: 200px;
      flex: 1;
    }
    .actions-grid {
      display: grid;
      grid-template-columns: 40px 40px 40px;
      align-items: center;
    }
  `,
})
export class DocumentModelListComponent implements OnInit {
  private documentModelService = inject(DocumentModelService);
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private pageHeader = inject(PageHeaderService);

  readonly PERMISSIONS = PERMISSIONS;

  columns: TableColumn[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'categoryName', label: 'Category', sortable: true },
    { key: 'tags', label: 'Tags' },
    { key: 'createdByName', label: 'Created By' },
    { key: 'createdAt', label: 'Created', sortable: true },
    { key: 'actions', label: '' },
  ];

  documents = signal<DocumentModelListItem[]>([]);
  total = signal(0);
  categories = signal<Category[]>([]);
  tags = signal<Tag[]>([]);

  searchQuery = '';
  selectedCategoryId = '';
  selectedTagId = '';
  private currentPage = 1;

  userPermissions = () => {
    const user = this.authStore.user();
    if (!user) return [];
    return ROLE_PERMISSIONS[user.role as Role] ?? [];
  };

  ngOnInit() {
    this.pageHeader.set({ title: 'Document Models', subtitle: 'Manage and categorize document models' });
    this.loadDocuments(1);
    this.loadFilters();
  }

  onPage(event: { pageIndex: number; pageSize: number }) {
    this.loadDocuments(event.pageIndex + 1, event.pageSize);
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadDocuments(1);
  }

  navigateToCreate() {
    this.router.navigate(['/document-models/new']);
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/document-models', id, 'edit']);
  }

  download(doc: DocumentModelListItem) {
    this.documentModelService.downloadDocument(doc.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName ?? 'download';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  confirmDelete(doc: DocumentModelListItem) {
    const dialogRef = this.dialog.open(UiConfirmDialogComponent, {
      data: {
          title: 'Delete Document Model',
        message: `Are you sure you want to delete "${doc.title}"?`,
      } satisfies ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.documentModelService.deleteDocument(doc.id).subscribe({
          next: () => {
            this.snackBar.open('Document Model deleted', 'Close', { duration: 3000 });
            this.loadDocuments(this.currentPage);
          },
          error: () => {
            this.snackBar.open('Failed to delete document model', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  openCategoryManagement() {
    const dialogRef = this.dialog.open(CategoryManagementComponent, {
      width: '600px',
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadFilters();
    });
  }

  openTagManagement() {
    const dialogRef = this.dialog.open(TagManagementComponent, {
      width: '500px',
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadFilters();
    });
  }

  private loadDocuments(page: number, pageSize = 20) {
    this.currentPage = page;
    this.documentModelService
      .listDocuments({
        page,
        pageSize,
        categoryId: this.selectedCategoryId || undefined,
        tagId: this.selectedTagId || undefined,
        search: this.searchQuery || undefined,
      })
      .subscribe((res) => {
        if (res.success && res.data) {
          this.documents.set(res.data.items);
          this.total.set(res.data.total);
        }
      });
  }

  private loadFilters() {
    this.documentModelService.listCategories().subscribe((res) => {
      if (res.success && res.data) this.categories.set(res.data);
    });
    this.documentModelService.listTags().subscribe((res) => {
      if (res.success && res.data) this.tags.set(res.data);
    });
  }
}
