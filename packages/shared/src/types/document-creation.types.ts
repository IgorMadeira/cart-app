import type { DocumentGenerationProvider, DocumentGenerationWarning } from './document-generation.types';

export interface DocumentCreationParty {
  id: number;
  nome: string;
  cpf_cnpj?: string | null;
  pessoa_id?: number | null;
  percentual?: number | null;
  tipo_descricao?: string | null;
  sequencia?: number | null;
  representante?: string | null;
  representante_id?: number | null;
}

export interface DocumentCreationAsset {
  id: number;
  descricao: string;
  matricula?: string | null;
  alienantes: DocumentCreationParty[];
  adquirentes: DocumentCreationParty[];
  vlr_alienacao?: number | null;
  vlr_avaliacao?: number | null;
}

export interface DocumentCreationAto {
  id: number;
  mne?: string | null;
  bens: DocumentCreationAsset[];
  token?: string | null;
  valor?: number | null;
  status?: string | null;
  created?: string | null;
  pessoas: DocumentCreationParty[];
  user_id?: number | null;
  excluido?: boolean;
  link_ato?: string | null;
  livro_id?: number | null;
  protocolo?: number | null;
  codigo1_tj?: string | null;
  codigo2_tj?: string | null;
  grs_numero?: string | null;
  link_livro?: string | null;
  observacao?: string | null;
  valor_tsnr?: number | null;
  ato_tipo_id?: number | null;
  cartorio_id?: number | null;
  dt_abertura?: string | null;
  folha_final?: number | null;
  folha_total?: number | null;
  texto_final?: string | null;
  valor_selos?: number | null;
  dt_casamento?: string | null;
  dt_envio_doi?: string | null;
  dt_lavratura?: string | null;
  livro_numero?: number | null;
  ordemserv_id?: number | null;
  texto_minuta?: string | null;
  folha_inicial?: number | null;
  dt_cancelamento?: string | null;
  dt_envio_consec?: string | null;
  user_alteracao_id?: number | null;
  user_lavratura_id?: number | null;
  valor_emolumentos?: number | null;
  ato_tipo_descricao?: string | null;
  qtd_filhos_maiores?: number | null;
  qtd_filhos_menores?: number | null;
  motivo_cancelamento?: string | null;
  protocolo_provisorio?: string | null;
  responsavel_menores_id?: number | null;
  tabvalores_regimecasamento_id?: number | null;
}

export interface DocumentCreationSupportingDocument {
  id: string;
  fileName: string;
  fileType: string | null;
  fileSize: number;
  content: string;
}

export interface CreateDocumentRequest {
  ato: DocumentCreationAto;
  documents?: DocumentCreationSupportingDocument[];
  requesterInstructions?: string;
}

export type DocumentConformityPhase = 'pre_creation' | 'post_creation';

export type PreValidateDocumentConformityRequest = CreateDocumentRequest;

export type PostValidateDocumentConformityRequest = CreateDocumentRequest & {
  generatedContent: string;
};

export type DocumentConformityStatus = 'conformant' | 'attention_required' | 'blocked';

export type DocumentConformityCheckStatus = 'passed' | 'attention' | 'failed';

export interface DocumentConformityCheck {
  code: string;
  label: string;
  status: DocumentConformityCheckStatus;
  message: string;
}

export interface DocumentConformityResult {
  provider: DocumentGenerationProvider;
  model: string;
  phase: DocumentConformityPhase;
  status: DocumentConformityStatus;
  checks: DocumentConformityCheck[];
  warnings: DocumentGenerationWarning[];
  validatedAt: string;
}

export interface CreateDocumentResult {
  provider: DocumentGenerationProvider;
  model: string;
  title: string;
  content: string;
  warnings: DocumentGenerationWarning[];
  sourceAtoId: number;
  token: string | null;
  atoTipoDescricao: string | null;
  generatedAt: string;
}
