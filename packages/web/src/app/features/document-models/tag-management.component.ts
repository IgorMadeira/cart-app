import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UiDialogComponent } from '@app001/ui';
import type { Tag } from '@app001/shared';
import { DocumentModelService } from '../../core/document-model.service';

@Component({
  selector: 'app-tag-management',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatSnackBarModule,
    UiDialogComponent,
  ],
  template: `
    <ui-dialog title="Manage Tags">
      <div class="add-form">
        <mat-form-field appearance="outline" class="name-field">
          <mat-label>Tag name</mat-label>
          <input matInput [(ngModel)]="newTagName" (keyup.enter)="addTag()" />
        </mat-form-field>
        <button mat-icon-button color="primary" (click)="addTag()" [disabled]="!newTagName.trim()">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      <div class="tag-list">
        @for (tag of tags(); track tag.id) {
          <mat-chip-row (removed)="deleteTag(tag)">
            {{ tag.name }}
            <button matChipRemove [attr.aria-label]="'Remove ' + tag.name">
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip-row>
        }
      </div>

      @if (tags().length === 0) {
        <p class="empty-message">No tags yet. Add one above.</p>
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
    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .empty-message {
      text-align: center;
      color: rgba(0, 0, 0, 0.54);
      padding: 24px;
    }
  `,
})
export class TagManagementComponent implements OnInit {
  private documentModelService = inject(DocumentModelService);
  private dialogRef = inject(MatDialogRef<TagManagementComponent>);
  private snackBar = inject(MatSnackBar);

  tags = signal<Tag[]>([]);
  newTagName = '';

  ngOnInit() {
    this.loadTags();
  }

  addTag() {
    const name = this.newTagName.trim();
    if (!name) return;

    this.documentModelService.createTag({ name }).subscribe({
      next: (res) => {
        if (res.success) {
          this.newTagName = '';
          this.loadTags();
        }
      },
      error: (err) => {
        const message = err.error?.error?.message ?? 'Failed to create tag';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      },
    });
  }

  deleteTag(tag: Tag) {
    this.documentModelService.deleteTag(tag.id).subscribe({
      next: () => {
        this.loadTags();
        this.snackBar.open(`Tag "${tag.name}" deleted`, 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to delete tag', 'Close', { duration: 3000 });
      },
    });
  }

  private loadTags() {
    this.documentModelService.listTags().subscribe((res) => {
      if (res.success && res.data) this.tags.set(res.data);
    });
  }
}
