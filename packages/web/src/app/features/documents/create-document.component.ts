import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UiPageShellComponent } from '@app001/ui';
import {
  DocumentCreationAtoSchema,
  type CreateDocumentResult,
  type CreateDocumentRequest,
  type DocumentConformityResult,
  type DocumentCreationAto,
  type DocumentCreationParty,
  type DocumentCreationSupportingDocument,
} from '@app001/shared';
import { PageHeaderService } from '../../core/page-header.service';
import { DocumentCreationService } from '../../core/document-creation.service';
import { EXTERNAL_TEXT_EDITOR_LOADER } from '../../core/external-text-editor.service';

const NAVIGATION_STATE_SOURCE_ID = 'navigation-state';

interface AtoSourceOption {
  id: string;
  label: string;
  description: string;
  ato: DocumentCreationAto;
}

const SAMPLE_ATO_SOURCES: AtoSourceOption[] = [
  {
    id: 'sample-urban-sale',
    label: 'Sample: Urban property sale',
    description: 'Synthetic sale and purchase ato with multiple sellers, one buyer, and an apartment asset.',
    ato: {
      id: 10001,
      mne: null,
      bens: [
        {
          id: 501,
          descricao: 'APARTAMENTO EXEMPLO 201, situado na Rua Modelo, nº 100, Centro, composto por sala, três quartos, cozinha, área de serviço e uma vaga de garagem, com área privativa de 110,00m².',
          matricula: '00000',
          alienantes: [
            {
              id: 7001,
              nome: 'MARIA EXEMPLO DA SILVA',
              cpf_cnpj: '00000000000',
              pessoa_id: 9001,
              percentual: 50,
              tipo_descricao: 'VENDEDOR(A)',
            },
            {
              id: 7002,
              nome: 'JOAO EXEMPLO DA SILVA',
              cpf_cnpj: '11111111111',
              pessoa_id: 9002,
              percentual: 50,
              tipo_descricao: 'VENDEDOR(A)',
            },
          ],
          adquirentes: [
            {
              id: 7003,
              nome: 'EMPRESA EXEMPLO LTDA',
              cpf_cnpj: '00000000000100',
              pessoa_id: 9101,
              percentual: 100,
              tipo_descricao: 'COMPRADOR(A)',
            },
          ],
          vlr_alienacao: 1250000,
          vlr_avaliacao: 1300000,
        },
      ],
      token: 'SAMPLE1',
      valor: 4701.59,
      status: 'EM EDIÇÃO',
      created: '2026-05-17T09:00:00.000-03:00',
      pessoas: [
        {
          id: 8001,
          nome: 'MARIA EXEMPLO DA SILVA',
          cpf_cnpj: '00000000000',
          pessoa_id: 9001,
          tipo_descricao: 'VENDEDOR(A)',
        },
        {
          id: 8002,
          nome: 'JOAO EXEMPLO DA SILVA',
          cpf_cnpj: '11111111111',
          pessoa_id: 9002,
          tipo_descricao: 'VENDEDOR(A)',
        },
        {
          id: 8003,
          nome: 'EMPRESA EXEMPLO LTDA',
          cpf_cnpj: '00000000000100',
          pessoa_id: 9101,
          tipo_descricao: 'COMPRADOR(A)',
        },
      ],
      user_id: 1,
      excluido: false,
      ato_tipo_id: 235,
      cartorio_id: 1,
      livro_numero: 1,
      ordemserv_id: 5001,
      folha_inicial: 10,
      folha_final: 12,
      folha_total: 3,
      valor_selos: 263.97,
      valor_tsnr: 211.32,
      valor_emolumentos: 4226.3,
      ato_tipo_descricao: 'VENDA E COMPRA',
      protocolo: 1001,
    },
  },
  {
    id: 'sample-rural-sale',
    label: 'Sample: Rural property sale',
    description: 'Synthetic ato with rural property description, legal representative, and agricultural buyer.',
    ato: {
      id: 10002,
      mne: null,
      bens: [
        {
          id: 502,
          descricao: 'FAZENDA EXEMPLO, situada no Município Modelo/AL, com área total de 297,5152 ha, perímetro georreferenciado e confrontações constantes do memorial descritivo arquivado.',
          matricula: '11111',
          alienantes: [
            {
              id: 7101,
              nome: 'AGROPECUARIA EXEMPLO S/A',
              cpf_cnpj: '11111111000111',
              pessoa_id: 9201,
              percentual: 100,
              tipo_descricao: 'VENDEDOR(A)',
            },
          ],
          adquirentes: [
            {
              id: 7102,
              nome: 'COMPRADOR RURAL EXEMPLO LTDA',
              cpf_cnpj: '22222222000122',
              pessoa_id: 9301,
              percentual: 100,
              tipo_descricao: 'COMPRADOR(A)',
            },
          ],
          vlr_alienacao: 700000,
          vlr_avaliacao: 700000,
        },
      ],
      token: 'SAMPLE2',
      valor: 0,
      status: 'EM EDIÇÃO',
      created: '2026-05-17T10:00:00.000-03:00',
      pessoas: [
        {
          id: 8101,
          nome: 'AGROPECUARIA EXEMPLO S/A',
          cpf_cnpj: '11111111000111',
          pessoa_id: 9201,
          tipo_descricao: 'VENDEDOR(A)',
        },
        {
          id: 8102,
          nome: 'ANA REPRESENTANTE EXEMPLO',
          cpf_cnpj: '22222222222',
          pessoa_id: 9202,
          tipo_descricao: 'REPRESENTANTE LEGAL',
        },
        {
          id: 8103,
          nome: 'COMPRADOR RURAL EXEMPLO LTDA',
          cpf_cnpj: '22222222000122',
          pessoa_id: 9301,
          tipo_descricao: 'COMPRADOR(A)',
        },
      ],
      user_id: 1,
      excluido: false,
      ato_tipo_id: 235,
      cartorio_id: 1,
      ordemserv_id: 5002,
      valor_selos: 0,
      valor_emolumentos: 0,
      ato_tipo_descricao: 'VENDA E COMPRA',
    },
  },
];

@Component({
  selector: 'app-create-document',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    UiPageShellComponent,
  ],
  template: `
    <ui-page-shell>
      <ng-container actions>
        <button
          mat-stroked-button
          type="button"
          (click)="preValidateConformity()"
          [disabled]="!sourceAto() || preValidating()"
        >
          <mat-icon>check_circle</mat-icon>
          AI pre-check
        </button>
        <button
          mat-flat-button
          color="primary"
          type="button"
          (click)="generateDocument()"
          [disabled]="!sourceAto() || loading()"
        >
          <mat-icon>play_arrow</mat-icon>
          Generate
        </button>
        <button
          mat-stroked-button
          type="button"
          (click)="postValidateConformity()"
          [disabled]="!sourceAto() || !generatedContent() || postValidating()"
        >
          <mat-icon>check</mat-icon>
          AI post-check
        </button>
        <button
          mat-stroked-button
          type="button"
          (click)="openExternalEditor()"
          [disabled]="!generatedContent()"
        >
          <mat-icon>launch</mat-icon>
          Open editor
        </button>
        <button
          mat-stroked-button
          type="button"
          (click)="copyContent()"
          [disabled]="!generatedContent()"
        >
          <mat-icon>content_copy</mat-icon>
          Copy
        </button>
      </ng-container>

      <mat-card class="source-picker-card">
        <mat-card-content class="source-picker-content">
          <mat-form-field appearance="outline" class="source-picker-field">
            <mat-label>Ato source</mat-label>
            <mat-select
              [ngModel]="selectedSourceId()"
              (ngModelChange)="selectAtoSource($event)"
            >
              @if (navigationAto()) {
                <mat-option [value]="NAVIGATION_STATE_SOURCE_ID">Navigation state</mat-option>
              }
              @for (source of sourceOptions; track source.id) {
                <mat-option [value]="source.id">{{ source.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <div class="source-picker-copy">
            <strong>{{ selectedSourceLabel() }}</strong>
            <span>{{ selectedSourceDescription() }}</span>
          </div>
        </mat-card-content>
      </mat-card>

      @if (sourceAto(); as ato) {
        <div class="create-document-layout">
          <section class="source-column">
            <mat-card>
              <mat-card-header>
                <mat-icon mat-card-avatar>receipt</mat-icon>
                <mat-card-title>{{ getDocumentTitle(ato) }}</mat-card-title>
                <mat-card-subtitle>{{ getAtoSubtitle(ato) }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <dl class="summary-grid">
                  <div>
                    <dt>Status</dt>
                    <dd>{{ getText(ato.status) }}</dd>
                  </div>
                  <div>
                    <dt>Protocol</dt>
                    <dd>{{ getNumberText(ato.protocolo) }}</dd>
                  </div>
                  <div>
                    <dt>Book</dt>
                    <dd>{{ getNumberText(ato.livro_numero) }}</dd>
                  </div>
                  <div>
                    <dt>Pages</dt>
                    <dd>{{ getNumberText(ato.folha_inicial) }} - {{ getNumberText(ato.folha_final) }}</dd>
                  </div>
                  <div>
                    <dt>Amount</dt>
                    <dd>{{ formatMoney(ato.valor) }}</dd>
                  </div>
                  <div>
                    <dt>Fees</dt>
                    <dd>{{ formatMoney(ato.valor_emolumentos) }}</dd>
                  </div>
                </dl>
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-header>
                <mat-icon mat-card-avatar>people</mat-icon>
                <mat-card-title>People</mat-card-title>
                <mat-card-subtitle>{{ ato.pessoas.length }} records</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="party-list">
                  @for (party of ato.pessoas; track party.id) {
                    <div class="party-row">
                      <div>
                        <strong>{{ party.nome }}</strong>
                        <span>{{ getText(party.cpf_cnpj, 'No CPF/CNPJ') }}</span>
                      </div>
                      <mat-chip>{{ getText(party.tipo_descricao, 'Role') }}</mat-chip>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>

            @for (asset of ato.bens; track asset.id) {
              <mat-card>
                <mat-card-header>
                  <mat-icon mat-card-avatar>home</mat-icon>
                  <mat-card-title>Asset {{ asset.id }}</mat-card-title>
                  <mat-card-subtitle>{{ formatMoney(asset.vlr_avaliacao) }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <p class="asset-description">{{ asset.descricao }}</p>
                  <mat-divider />
                  <div class="asset-parties">
                    <div>
                      <h3>Sellers</h3>
                      @for (seller of asset.alienantes; track seller.id) {
                        <p>{{ getPartyLine(seller) }}</p>
                      } @empty {
                        <p>No sellers informed.</p>
                      }
                    </div>
                    <div>
                      <h3>Buyers</h3>
                      @for (buyer of asset.adquirentes; track buyer.id) {
                        <p>{{ getPartyLine(buyer) }}</p>
                      } @empty {
                        <p>No buyers informed.</p>
                      }
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </section>

          <section class="generation-column">
            <mat-card>
              <mat-card-header>
                <mat-icon mat-card-avatar>note_add</mat-icon>
                <mat-card-title>Supporting Documents</mat-card-title>
                <mat-card-subtitle>{{ supportingDocuments().length }} document(s) added</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <label class="upload-button">
                  <input
                    #supportingDocumentFileInput
                    type="file"
                    multiple
                    accept=".txt,.md,.json,.xml,.html,.csv"
                    (change)="loadSupportingDocumentFiles(supportingDocumentFileInput)"
                  />
                  <mat-icon>file_upload</mat-icon>
                  Upload files
                </label>

                @if (supportingDocuments().length > 0) {
                  <div class="supporting-document-list">
                    @for (document of supportingDocuments(); track document.id) {
                      <div class="supporting-document-row">
                        <div>
                          <strong>{{ document.fileName }}</strong>
                          <span>{{ formatFileSize(document.fileSize) }} - {{ getText(document.fileType, 'text/plain') }}</span>
                        </div>
                        <button
                          mat-icon-button
                          type="button"
                          (click)="removeSupportingDocument(document.id)"
                          aria-label="Remove supporting document"
                        >
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    }
                  </div>
                }
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-header>
                <mat-icon mat-card-avatar>check_circle</mat-icon>
                <mat-card-title>AI Conformity</mat-card-title>
                <mat-card-subtitle>{{ getConformitySubtitle() }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="conformity-actions">
                  <button
                    mat-flat-button
                    color="primary"
                    type="button"
                    (click)="preValidateConformity()"
                    [disabled]="!sourceAto() || preValidating()"
                  >
                    @if (preValidating()) {
                      Validating source...
                    } @else {
                      AI pre-validation
                    }
                  </button>

                  <button
                    mat-stroked-button
                    type="button"
                    (click)="postValidateConformity()"
                    [disabled]="!sourceAto() || !generatedContent() || postValidating()"
                  >
                    @if (postValidating()) {
                      Validating document...
                    } @else {
                      AI post-validation
                    }
                  </button>
                </div>

                @if (preValidationResult(); as result) {
                  <section class="conformity-phase">
                    <h3>Pre-validation</h3>
                    <div class="conformity-summary" [class.conformity-blocked]="result.status === 'blocked'">
                      <strong>{{ getConformityStatusLabel(result.status) }}</strong>
                      <span>{{ result.model }} - {{ result.validatedAt }}</span>
                    </div>

                    <div class="conformity-checks">
                      @for (check of result.checks; track check.code) {
                        <div
                          class="conformity-check"
                          [class.check-passed]="check.status === 'passed'"
                          [class.check-attention]="check.status === 'attention'"
                          [class.check-failed]="check.status === 'failed'"
                        >
                          <mat-icon>{{ getConformityIcon(check.status) }}</mat-icon>
                          <div>
                            <strong>{{ check.label }}</strong>
                            <span>{{ check.message }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  </section>
                }

                @if (postValidationResult(); as result) {
                  <section class="conformity-phase">
                    <h3>Post-validation</h3>
                    <div class="conformity-summary" [class.conformity-blocked]="result.status === 'blocked'">
                      <strong>{{ getConformityStatusLabel(result.status) }}</strong>
                      <span>{{ result.model }} - {{ result.validatedAt }}</span>
                    </div>

                    <div class="conformity-checks">
                      @for (check of result.checks; track check.code) {
                        <div
                          class="conformity-check"
                          [class.check-passed]="check.status === 'passed'"
                          [class.check-attention]="check.status === 'attention'"
                          [class.check-failed]="check.status === 'failed'"
                        >
                          <mat-icon>{{ getConformityIcon(check.status) }}</mat-icon>
                          <div>
                            <strong>{{ check.label }}</strong>
                            <span>{{ check.message }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  </section>
                }
              </mat-card-content>
            </mat-card>

            <mat-card class="generation-card">
              <mat-card-header>
                <mat-icon mat-card-avatar>description</mat-icon>
                <mat-card-title>Generated Content</mat-card-title>
                <mat-card-subtitle>{{ getGenerationSubtitle() }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Additional instructions</mat-label>
                  <textarea
                    matInput
                    rows="4"
                    [ngModel]="requesterInstructions()"
                    (ngModelChange)="requesterInstructions.set($event)"
                  ></textarea>
                </mat-form-field>

                @if (loading()) {
                  <div class="loading-state">
                    <mat-spinner diameter="32" />
                    <span>Generating content...</span>
                  </div>
                } @else {
                  <mat-form-field appearance="outline" class="full-width content-field">
                    <mat-label>Document content</mat-label>
                    <textarea
                      matInput
                      rows="24"
                      [ngModel]="generatedContent()"
                      (ngModelChange)="generatedContent.set($event)"
                    ></textarea>
                  </mat-form-field>
                }

                @if (errorMessage()) {
                  <p class="error-message">{{ errorMessage() }}</p>
                }

                @if (generatedResult(); as result) {
                  @if (result.warnings.length > 0) {
                    <div class="warnings">
                      @for (warning of result.warnings; track warning.code) {
                        <mat-chip>{{ warning.message }}</mat-chip>
                      }
                    </div>
                  }
                }
              </mat-card-content>
            </mat-card>
          </section>
        </div>
      } @else {
        <mat-card class="empty-state">
          <mat-card-header>
            <mat-icon mat-card-avatar>info</mat-icon>
            <mat-card-title>No source data received</mat-card-title>
            <mat-card-subtitle>Open this page with navigation state containing an ato object.</mat-card-subtitle>
          </mat-card-header>
        </mat-card>
      }
    </ui-page-shell>
  `,
  styles: `
    .create-document-layout {
      display: grid;
      grid-template-columns: minmax(320px, 0.9fr) minmax(420px, 1.1fr);
      gap: 16px;
      align-items: start;
    }
    .source-picker-card {
      margin-bottom: 16px;
    }
    .source-picker-content {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .source-picker-field {
      width: min(360px, 100%);
    }
    .source-picker-copy {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 240px;
      flex: 1;
    }
    .source-picker-copy span {
      color: rgba(0, 0, 0, 0.64);
    }
    .source-column,
    .generation-column {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 0;
    }
    .generation-card {
      position: sticky;
      top: 0;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px 16px;
      margin: 0;
    }
    .summary-grid div {
      min-width: 0;
    }
    dt {
      color: rgba(0, 0, 0, 0.58);
      font-size: 12px;
      margin-bottom: 2px;
    }
    dd {
      margin: 0;
      overflow-wrap: anywhere;
    }
    .party-list,
    .asset-parties {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .party-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .party-row div {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .party-row span,
    .asset-parties p {
      color: rgba(0, 0, 0, 0.64);
      margin: 2px 0 0;
    }
    .asset-description {
      white-space: pre-wrap;
      line-height: 1.55;
      margin-top: 0;
    }
    .asset-parties {
      margin-top: 12px;
    }
    .asset-parties h3 {
      font-size: 14px;
      margin: 0 0 4px;
    }
    .upload-button {
      min-height: 36px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0 16px;
      border: 1px solid rgba(0, 0, 0, 0.32);
      border-radius: 4px;
      cursor: pointer;
    }
    .upload-button input {
      display: none;
    }
    .supporting-document-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 16px;
    }
    .supporting-document-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 8px 0;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
    }
    .supporting-document-row div {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .supporting-document-row span,
    .conformity-summary span,
    .conformity-check span {
      color: rgba(0, 0, 0, 0.64);
    }
    .conformity-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .conformity-phase {
      margin-top: 16px;
    }
    .conformity-phase h3 {
      font-size: 14px;
      margin: 0 0 8px;
    }
    .conformity-summary {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: 16px;
      padding: 12px;
      border-left: 4px solid #2e7d32;
      background: rgba(46, 125, 50, 0.08);
    }
    .conformity-blocked {
      border-left-color: #b00020;
      background: rgba(176, 0, 32, 0.08);
    }
    .conformity-checks {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
    }
    .conformity-check {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      padding: 8px 0;
    }
    .conformity-check div {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .check-passed mat-icon {
      color: #2e7d32;
    }
    .check-attention mat-icon {
      color: #b26a00;
    }
    .check-failed mat-icon {
      color: #b00020;
    }
    .full-width {
      width: 100%;
    }
    .content-field textarea {
      font-family: Consolas, 'Courier New', monospace;
      line-height: 1.45;
    }
    .loading-state {
      min-height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: rgba(0, 0, 0, 0.64);
    }
    .warnings {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    .error-message {
      color: #b00020;
      margin: 0 0 12px;
    }
    .empty-state {
      max-width: 640px;
    }
    @media (max-width: 960px) {
      .create-document-layout {
        grid-template-columns: 1fr;
      }
      .generation-card {
        position: static;
      }
    }
  `,
})
export class CreateDocumentComponent implements OnInit {
  readonly NAVIGATION_STATE_SOURCE_ID = NAVIGATION_STATE_SOURCE_ID;
  readonly sourceOptions = SAMPLE_ATO_SOURCES;

  private pageHeader = inject(PageHeaderService);
  private documentCreationService = inject(DocumentCreationService);
  private externalTextEditorLoader = inject(EXTERNAL_TEXT_EDITOR_LOADER);
  private snackBar = inject(MatSnackBar);
  private moneyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  navigationAto = signal<DocumentCreationAto | null>(null);
  selectedSourceId = signal('');
  sourceAto = signal<DocumentCreationAto | null>(null);
  supportingDocuments = signal<DocumentCreationSupportingDocument[]>([]);
  requesterInstructions = signal('');
  generatedResult = signal<CreateDocumentResult | null>(null);
  generatedContent = signal('');
  preValidationResult = signal<DocumentConformityResult | null>(null);
  postValidationResult = signal<DocumentConformityResult | null>(null);
  loading = signal(false);
  preValidating = signal(false);
  postValidating = signal(false);
  errorMessage = signal<string | null>(null);
  private supportingDocumentSequence = 1;

  ngOnInit(): void {
    this.pageHeader.set({
      title: 'Create Document',
      subtitle: 'Generate a standardized document from ato data',
      showBack: true,
      backRoute: '/dashboard',
    });

    const navigationAto = this.resolveAtoFromNavigation();
    this.navigationAto.set(navigationAto);

    if (navigationAto) {
      this.selectAtoSource(NAVIGATION_STATE_SOURCE_ID);
      return;
    }

    const firstSample = SAMPLE_ATO_SOURCES[0];
    if (firstSample) {
      this.selectAtoSource(firstSample.id);
    }
  }

  selectAtoSource(sourceId: string): void {
    this.selectedSourceId.set(sourceId);
    this.generatedResult.set(null);
    this.generatedContent.set('');
    this.clearValidationResults();
    this.errorMessage.set(null);

    const ato = this.getAtoForSource(sourceId);
    this.sourceAto.set(ato);

    if (ato) {
      this.generateDocument();
    }
  }

  generateDocument(): void {
    const request = this.buildCreateDocumentRequest();
    if (!request) return;

    this.loading.set(true);
    this.errorMessage.set(null);
    this.postValidationResult.set(null);

    this.documentCreationService.generateDocument(request).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success && response.data) {
          this.generatedResult.set(response.data);
          this.generatedContent.set(response.data.content);
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Failed to generate document content.');
      },
    });
  }

  preValidateConformity(): void {
    const request = this.buildCreateDocumentRequest();
    if (!request) return;

    this.preValidating.set(true);
    this.errorMessage.set(null);

    this.documentCreationService.preValidateConformity(request).subscribe({
      next: (response) => {
        this.preValidating.set(false);
        if (response.success && response.data) {
          this.preValidationResult.set(response.data);
        }
      },
      error: () => {
        this.preValidating.set(false);
        this.errorMessage.set('Failed to validate source conformity with AI.');
      },
    });
  }

  postValidateConformity(): void {
    const request = this.buildCreateDocumentRequest();
    if (!request) return;

    const generatedContent = this.generatedContent().trim();
    if (!generatedContent) {
      this.snackBar.open('Generate the document before post-validation', 'Close', { duration: 2500 });
      return;
    }

    this.postValidating.set(true);
    this.errorMessage.set(null);

    this.documentCreationService.postValidateConformity({ ...request, generatedContent }).subscribe({
      next: (response) => {
        this.postValidating.set(false);
        if (response.success && response.data) {
          this.postValidationResult.set(response.data);
        }
      },
      error: () => {
        this.postValidating.set(false);
        this.errorMessage.set('Failed to post-validate generated document with AI.');
      },
    });
  }

  loadSupportingDocumentFiles(input: HTMLInputElement): void {
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          this.snackBar.open(`Only text files can be loaded: ${file.name}`, 'Close', { duration: 2500 });
          return;
        }

        const content = reader.result.trim();
        if (!content) {
          this.snackBar.open(`File is empty: ${file.name}`, 'Close', { duration: 2500 });
          return;
        }

        this.supportingDocuments.update((documents) => [
          ...documents,
          {
            id: this.getNextSupportingDocumentId(),
            fileName: file.name,
            fileType: file.type || null,
            fileSize: file.size,
            content,
          },
        ]);
        this.clearValidationResults();
      };
      reader.onerror = () => {
        this.snackBar.open(`Failed to load text file: ${file.name}`, 'Close', { duration: 2500 });
      };
      reader.readAsText(file);
    }

    input.value = '';
  }

  removeSupportingDocument(documentId: string): void {
    this.supportingDocuments.update((documents) => documents.filter((document) => document.id !== documentId));
    this.clearValidationResults();
  }

  async openExternalEditor(): Promise<void> {
    const ato = this.sourceAto();
    if (!ato || !this.generatedContent()) return;

    const session = await this.externalTextEditorLoader.loadEditor({
      documentModelId: null,
      title: this.getDocumentTitle(ato),
      content: this.generatedContent(),
      language: 'text',
    });

    this.generatedContent.set(session.content);
    this.snackBar.open(session.message, 'Close', { duration: 3000 });
  }

  copyContent(): void {
    const content = this.generatedContent();
    if (!content) return;

    navigator.clipboard.writeText(content).then(() => {
      this.snackBar.open('Content copied', 'Close', { duration: 2500 });
    });
  }

  getDocumentTitle(ato: DocumentCreationAto): string {
    return `Minuta de ${this.getText(ato.ato_tipo_descricao, 'documento')}`;
  }

  getAtoSubtitle(ato: DocumentCreationAto): string {
    return `Ato ${ato.id} - token ${this.getText(ato.token)}`;
  }

  getGenerationSubtitle(): string {
    const result = this.generatedResult();
    if (!result) return 'Waiting for AI stub response';
    return `${result.model} - ${result.generatedAt}`;
  }

  getConformitySubtitle(): string {
    const postResult = this.postValidationResult();
    if (postResult) return `Post-validation: ${this.getConformityStatusLabel(postResult.status)}`;

    const preResult = this.preValidationResult();
    if (preResult) return `Pre-validation: ${this.getConformityStatusLabel(preResult.status)}`;

    return 'Run AI pre-validation before generation and AI post-validation after creation';
  }

  getConformityStatusLabel(status: string): string {
    if (status === 'conformant') return 'Conformant';
    if (status === 'attention_required') return 'Requires attention';
    return 'Blocked';
  }

  getConformityIcon(status: string): string {
    if (status === 'passed') return 'check_circle';
    if (status === 'attention') return 'warning';
    return 'error';
  }

  formatFileSize(fileSize: number): string {
    if (fileSize < 1024) return `${fileSize} B`;
    if (fileSize < 1024 * 1024) return `${Math.round(fileSize / 1024)} KB`;
    return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
  }

  selectedSourceLabel(): string {
    const sourceId = this.selectedSourceId();
    if (sourceId === NAVIGATION_STATE_SOURCE_ID) return 'Navigation state';

    const source = this.findSampleSource(sourceId);
    return source?.label ?? 'No source selected';
  }

  selectedSourceDescription(): string {
    const sourceId = this.selectedSourceId();
    if (sourceId === NAVIGATION_STATE_SOURCE_ID) {
      return 'Ato object received from the route navigation state.';
    }

    const source = this.findSampleSource(sourceId);
    return source?.description ?? 'Select a source to load ato data.';
  }

  getText(value: string | null | undefined, fallback = 'Not informed'): string {
    const trimmed = value?.trim();
    return trimmed ? trimmed : fallback;
  }

  getNumberText(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'Not informed';
    return String(value);
  }

  formatMoney(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'Not informed';
    return this.moneyFormatter.format(value);
  }

  getPartyLine(party: DocumentCreationParty): string {
    const documentNumber = this.getText(party.cpf_cnpj, 'No CPF/CNPJ');
    const percentage = party.percentual === null || party.percentual === undefined
      ? ''
      : ` - ${party.percentual}%`;

    return `${party.nome} (${documentNumber}${percentage})`;
  }

  private resolveAtoFromNavigation(): DocumentCreationAto | null {
    const historyState = window.history.state;
    const candidates = [
      historyState?.createDocumentData,
      historyState?.documentData,
      historyState?.ato,
      historyState,
    ];

    for (const candidate of candidates) {
      const result = DocumentCreationAtoSchema.safeParse(candidate);
      if (result.success) return result.data;
    }

    return null;
  }

  private buildCreateDocumentRequest(): CreateDocumentRequest | null {
    const ato = this.sourceAto();
    if (!ato) return null;

    const instructions = this.requesterInstructions().trim();
    const documents = this.supportingDocuments();

    return {
      ato,
      documents,
      requesterInstructions: instructions || undefined,
    };
  }

  private clearValidationResults(): void {
    this.preValidationResult.set(null);
    this.postValidationResult.set(null);
  }

  private getNextSupportingDocumentId(): string {
    const id = `supporting-document-${this.supportingDocumentSequence}`;
    this.supportingDocumentSequence += 1;
    return id;
  }

  private getAtoForSource(sourceId: string): DocumentCreationAto | null {
    if (sourceId === NAVIGATION_STATE_SOURCE_ID) {
      return this.navigationAto();
    }

    return this.findSampleSource(sourceId)?.ato ?? null;
  }

  private findSampleSource(sourceId: string): AtoSourceOption | null {
    for (const source of SAMPLE_ATO_SOURCES) {
      if (source.id === sourceId) return source;
    }

    return null;
  }
}
