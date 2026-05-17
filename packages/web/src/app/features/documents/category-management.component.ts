import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UiDialogComponent } from '@app001/ui';
import type { Category } from '@app001/shared';
import { DocumentModelService } from '../../core/document.service';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatSnackBarModule,
    UiDialogComponent,
  ],
  template: `
    <ui-dialog title="Manage Categories">
      <div class="add-form">
        <mat-form-field appearance="outline" class="name-field">
          <mat-label>Category name</mat-label>
          <input matInput [(ngModel)]="newCategoryName" (keyup.enter)="addCategory()" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="desc-field">
          <mat-label>Description (optional)</mat-label>
          <input matInput [(ngModel)]="newCategoryDescription" (keyup.enter)="addCategory()" />
        </mat-form-field>
        <button mat-icon-button color="primary" (click)="addCategory()" [disabled]="!newCategoryName.trim()">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      @for (cat of categories(); track cat.id) {
        <div class="category-row">
          @if (editingId === cat.id) {
            <mat-form-field appearance="outline" class="edit-field">
              <input matInput [(ngModel)]="editName" (keyup.enter)="saveEdit(cat.id)" />
            </mat-form-field>
            <button mat-icon-button (click)="saveEdit(cat.id)">
              <mat-icon>check</mat-icon>
            </button>
            <button mat-icon-button (click)="cancelEdit()">
              <mat-icon>close</mat-icon>
            </button>
          } @else {
            <div class="category-info">
              <span class="category-name">{{ cat.name }}</span>
              @if (cat.description) {
                <span class="category-desc">{{ cat.description }}</span>
              }
            </div>
            <button mat-icon-button class="action-edit" (click)="startEdit(cat)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button class="action-delete" (click)="deleteCategory(cat)">
              <mat-icon>delete</mat-icon>
            </button>
          }
        </div>
      }

      @if (categories().length === 0) {
        <p class="empty-message">No categories yet. Add one above.</p>
      }

      <button actions mat-button mat-dialog-close>Close</button>
    </ui-dialog>
  `,
  styles: `
    .add-form {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 16px;
    }
    .name-field {
      flex: 1;
    }
    .desc-field {
      flex: 1;
    }
    .category-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }
    .category-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .category-name {
      font-weight: 500;
    }
    .category-desc {
      font-size: 0.85em;
      color: rgba(0, 0, 0, 0.54);
    }
    .edit-field {
      flex: 1;
    }
    .empty-message {
      text-align: center;
      color: rgba(0, 0, 0, 0.54);
      padding: 24px;
    }
  `,
})
export class CategoryManagementComponent implements OnInit {
  private documentModelService = inject(DocumentModelService);
  private dialogRef = inject(MatDialogRef<CategoryManagementComponent>);
  private snackBar = inject(MatSnackBar);

  categories = signal<Category[]>([]);
  newCategoryName = '';
  newCategoryDescription = '';
  editingId: string | null = null;
  editName = '';

  ngOnInit() {
    this.loadCategories();
  }

  addCategory() {
    const name = this.newCategoryName.trim();
    if (!name) return;

    this.documentModelService      .createCategory({ name, description: this.newCategoryDescription.trim() || undefined })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.newCategoryName = '';
            this.newCategoryDescription = '';
            this.loadCategories();
          }
        },
        error: (err) => {
          const message = err.error?.error?.message ?? 'Failed to create category';
          this.snackBar.open(message, 'Close', { duration: 3000 });
        },
      });
  }

  startEdit(cat: Category) {
    this.editingId = cat.id;
    this.editName = cat.name;
  }

  cancelEdit() {
    this.editingId = null;
    this.editName = '';
  }

  saveEdit(id: string) {
    const name = this.editName.trim();
    if (!name) return;

    this.documentModelService.updateCategory(id, { name }).subscribe({
      next: (res) => {
        if (res.success) {
          this.editingId = null;
          this.editName = '';
          this.loadCategories();
        }
      },
      error: (err) => {
        const message = err.error?.error?.message ?? 'Failed to update category';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      },
    });
  }

  deleteCategory(cat: Category) {
    this.documentModelService.deleteCategory(cat.id).subscribe({
      next: () => {
        this.loadCategories();
        this.snackBar.open(`Category "${cat.name}" deleted`, 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to delete category', 'Close', { duration: 3000 });
      },
    });
  }

  private loadCategories() {
    this.documentModelService.listCategories().subscribe((res) => {
      if (res.success && res.data) this.categories.set(res.data);
    });
  }
}
