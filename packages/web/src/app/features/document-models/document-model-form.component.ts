import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { UiPageShellComponent } from '@app001/ui';
import type { Category, DocumentGenerationRequest, DocumentModelListItem, ExternalTextEditorLanguage, Tag } from '@app001/shared';
import { DocumentModelService } from '../../core/document-model.service';
import { PageHeaderService } from '../../core/page-header.service';
import { EXTERNAL_TEXT_EDITOR_LOADER } from '../../core/external-text-editor.service';

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
    MatCheckboxModule,
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

            <div class="content-actions">
              <button mat-stroked-button type="button" (click)="loadExternalEditor()">
                <mat-icon>edit_note</mat-icon>
                Load editor
              </button>
            </div>

            <section class="ai-section">
              <div class="section-header">
                <h2>AI generation</h2>
                <mat-checkbox formControlName="aiEnabled">Enabled</mat-checkbox>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>AI instructions</mat-label>
                <textarea matInput formControlName="aiInstructions" rows="5"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Legislation rules</mat-label>
                <textarea matInput formControlName="legislationRules" rows="5"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Linked document models</mat-label>
                <mat-select formControlName="linkedDocumentModelIds" multiple>
                  @for (doc of linkedDocumentOptions(); track doc.id) {
                    <mat-option [value]="doc.id">{{ doc.title }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              @if (isEdit) {
                <div class="generation-actions">
                  <button
                    mat-stroked-button
                    color="primary"
                    type="button"
                    [disabled]="generationLoading"
                    (click)="generateDocument()"
                  >
                    <mat-icon>auto_awesome</mat-icon>
                    {{ generationLoading ? 'Generating…' : 'Generate draft' }}
                  </button>
                </div>
              }

              @if (generatedPreview()) {
                <div class="generated-preview">
                  <div class="preview-header">
                    <strong>Generated draft</strong>
                    <div class="preview-actions">
                      <button mat-button type="button" (click)="dismissGeneratedPreview()">Dismiss</button>
                      <button mat-flat-button color="primary" type="button" (click)="applyGeneratedContent()">
                        Apply to content
                      </button>
                    </div>
                  </div>
                  @if (generationWarnings().length > 0) {
                    <ul class="warnings">
                      @for (warning of generationWarnings(); track warning) {
                        <li>{{ warning }}</li>
                      }
                    </ul>
                  }
                  <pre>{{ generatedPreview() }}</pre>
                </div>
              }
            </section>

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
                #fileInput
                (change)="onFileSelected(fileInput.files)"
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
    .content-actions {
      display: flex;
      justify-content: flex-end;
      margin: -4px 0 16px;
    }
    .ai-section {
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .section-header,
    .preview-header,
    .preview-actions,
    .generation-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .section-header,
    .preview-header {
      justify-content: space-between;
      margin-bottom: 12px;
    }
    h2 {
      font-size: 18px;
      font-weight: 500;
      margin: 0;
    }
    .generation-actions {
      justify-content: flex-end;
      margin-bottom: 16px;
    }
    .generated-preview {
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
      padding: 16px;
      background: #fafafa;
    }
    .generated-preview pre {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      margin: 0;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.5;
    }
    .warnings {
      margin: 0 0 12px;
      color: #8a5a00;
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
  private externalTextEditor = inject(EXTERNAL_TEXT_EDITOR_LOADER);

  categories = signal<Category[]>([]);
  tags = signal<Tag[]>([]);
  documentModelOptions = signal<DocumentModelListItem[]>([]);
  generatedPreview = signal<string | null>(null);
  generationWarnings = signal<string[]>([]);
  loading = false;
  generationLoading = false;
  isEdit = false;
  documentModelId = '';
  existingFileName: string | null = null;
  selectedFile: File | null = null;

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    content: [''],
    aiEnabled: [false],
    aiInstructions: [''],
    legislationRules: [''],
    categoryId: [''],
    tagIds: this.fb.nonNullable.control<string[]>([]),
    linkedDocumentModelIds: this.fb.nonNullable.control<string[]>([]),
  });

  linkedDocumentOptions = () => this.documentModelOptions().filter((doc) => doc.id !== this.documentModelId);

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

  onFileSelected(files: FileList | null) {
    this.selectedFile = files?.item(0) ?? null;
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;

    const values = this.form.getRawValue();
    const formData = new FormData();
    formData.append('title', values.title);
    if (values.description) formData.append('description', values.description);
    if (values.content) formData.append('content', values.content);
    formData.append('aiEnabled', String(values.aiEnabled));
    formData.append('aiInstructions', values.aiInstructions);
    formData.append('legislationRules', values.legislationRules);
    if (values.categoryId) formData.append('categoryId', values.categoryId);
    if (values.tagIds.length > 0) formData.append('tagIds', JSON.stringify(values.tagIds));
    formData.append('linkedDocumentModelIds', JSON.stringify(values.linkedDocumentModelIds));
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

  generateDocument() {
    if (!this.isEdit || this.generationLoading) return;

    this.generationLoading = true;
    const values = this.form.getRawValue();
    const request: DocumentGenerationRequest = {
      requesterInstructions: values.aiInstructions || undefined,
    };

    this.documentModelService.generateDocument(this.documentModelId, request).subscribe({
      next: (res) => {
        this.generationLoading = false;
        if (res.success && res.data) {
          this.generatedPreview.set(res.data.content);
          this.generationWarnings.set(res.data.warnings.map((warning) => warning.message));
        }
      },
      error: (err) => {
        this.generationLoading = false;
        const message = err.error?.error?.message ?? 'Failed to generate draft';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      },
    });
  }

  applyGeneratedContent() {
    const content = this.generatedPreview();
    if (!content) return;
    this.form.controls.content.setValue(content);
    this.dismissGeneratedPreview();
  }

  dismissGeneratedPreview() {
    this.generatedPreview.set(null);
    this.generationWarnings.set([]);
  }

  async loadExternalEditor() {
    const values = this.form.getRawValue();
    const session = await this.externalTextEditor.loadEditor({
      documentModelId: this.documentModelId || null,
      title: values.title || 'Untitled Document Model',
      content: values.content,
      language: this.detectEditorLanguage(),
    });

    this.form.controls.content.setValue(session.content);
    this.snackBar.open(session.message, 'Close', { duration: 3000 });
  }

  private loadOptions() {
    this.documentModelService.listCategories().subscribe((res) => {
      if (res.success && res.data) this.categories.set(res.data);
    });
    this.documentModelService.listTags().subscribe((res) => {
      if (res.success && res.data) this.tags.set(res.data);
    });
    this.documentModelService.listDocuments({ page: 1, pageSize: 100, sortBy: 'title', sortOrder: 'asc' }).subscribe((res) => {
      if (res.success && res.data) this.documentModelOptions.set(res.data.items);
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
          aiEnabled: doc.aiEnabled,
          aiInstructions: doc.aiInstructions ?? '',
          legislationRules: doc.legislationRules ?? '',
          categoryId: doc.categoryId ?? '',
          tagIds: doc.tags.map((t) => t.id),
          linkedDocumentModelIds: doc.linkedDocuments.map((linkedDocument) => linkedDocument.id),
        });
        this.existingFileName = doc.fileName;
      }
    });
  }

  private detectEditorLanguage(): ExternalTextEditorLanguage {
    const fileName = this.selectedFile?.name ?? this.existingFileName ?? '';
    const normalizedFileName = fileName.toLowerCase();

    if (normalizedFileName.endsWith('.md')) return 'markdown';
    if (normalizedFileName.endsWith('.html') || normalizedFileName.endsWith('.htm')) return 'html';
    if (normalizedFileName.endsWith('.json')) return 'json';
    if (normalizedFileName.endsWith('.xml')) return 'xml';
    return 'text';
  }
}
