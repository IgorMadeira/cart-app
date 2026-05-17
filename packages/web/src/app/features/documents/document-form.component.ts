import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { UiPageShellComponent } from '@app001/ui';
import type { Category, Tag } from '@app001/shared';
import { DocumentModelService } from '../../core/document.service';
import { PageHeaderService } from '../../core/page-header.service';

@Component({
  selector: 'app-document-model-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    MatCardModule,
    UiPageShellComponent,
  ],
  template: `
    <ui-page-shell>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-card>
          <mat-card-content>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Title</mat-label>
              <input matInput formControlName="title" />
              @if (form.controls.title.hasError('required')) {
                <mat-error>Title is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Content</mat-label>
              <textarea matInput formControlName="content" rows="8"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Category</mat-label>
              <mat-select formControlName="categoryId">
                <mat-option value="">None</mat-option>
                @for (cat of categories(); track cat.id) {
                  <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tags</mat-label>
              <mat-select formControlName="tagIds" multiple>
                @for (tag of tags(); track tag.id) {
                  <mat-option [value]="tag.id">{{ tag.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div class="file-section">
              <label class="file-label">File attachment</label>
              @if (existingFileName && !selectedFile) {
                <div class="existing-file">
                  <mat-icon>attach_file</mat-icon>
                  <span>{{ existingFileName }}</span>
                </div>
              }
              <input
                type="file"
                (change)="onFileSelected($event)"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.md,.html,.xml,.json"
              />
            </div>
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
      max-width: 800px;
    }
    mat-card-content {
      display: flex;
      flex-direction: column;
    }
    .file-section {
      margin: 16px 0;
    }
    .file-label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }
    .existing-file {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.87);
    }
  `,
})
export class DocumentModelFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private documentModelService = inject(DocumentModelService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private pageHeader = inject(PageHeaderService);

  categories = signal<Category[]>([]);
  tags = signal<Tag[]>([]);
  loading = false;
  isEdit = false;
  documentModelId = '';
  existingFileName: string | null = null;
  selectedFile: File | null = null;

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    content: [''],
    categoryId: [''],
    tagIds: [[] as string[]],
  });

  ngOnInit() {
    this.loadOptions();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.documentModelId = id;
      this.loadDocumentModel(id);
    }
    this.pageHeader.set({
      title: this.isEdit ? 'Edit Document Model' : 'New Document Model',
      subtitle: 'Fill in the document model details',
      showBack: true,
      backRoute: '/document-models',
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;

    const values = this.form.getRawValue();
    const formData = new FormData();
    formData.append('title', values.title);
    if (values.description) formData.append('description', values.description);
    if (values.content) formData.append('content', values.content);
    if (values.categoryId) formData.append('categoryId', values.categoryId);
    if (values.tagIds.length > 0) formData.append('tagIds', JSON.stringify(values.tagIds));
    if (this.selectedFile) formData.append('file', this.selectedFile);

    const request$ = this.isEdit
      ? this.documentModelService.updateDocument(this.documentModelId, formData)
      : this.documentModelService.createDocument(formData);

    request$.subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open(
            this.isEdit ? 'Document Model updated' : 'Document Model created',
            'Close',
            { duration: 3000 },
          );
          this.router.navigate(['/document-models']);
        }
      },
      error: (err) => {
        this.loading = false;
        const message = err.error?.message ?? 'Failed to save document model';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      },
    });
  }

  cancel() {
    this.router.navigate(['/document-models']);
  }

  private loadOptions() {
    this.documentModelService.listCategories().subscribe((res) => {
      if (res.success && res.data) this.categories.set(res.data);
    });
    this.documentModelService.listTags().subscribe((res) => {
      if (res.success && res.data) this.tags.set(res.data);
    });
  }

  private loadDocumentModel(id: string) {
    this.documentModelService.getDocument(id).subscribe((res) => {
      if (res.success && res.data) {
        const doc = res.data;
        this.form.patchValue({
          title: doc.title,
          description: doc.description ?? '',
          content: doc.content ?? '',
          categoryId: doc.categoryId ?? '',
          tagIds: doc.tags.map((t) => t.id),
        });
        this.existingFileName = doc.fileName;
      }
    });
  }
}
