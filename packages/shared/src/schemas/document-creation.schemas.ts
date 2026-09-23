import { z } from 'zod';

const OptionalNullableStringSchema = z.string().nullable().optional();
const OptionalNullableNumberSchema = z.number().nullable().optional();

export const DocumentCreationPartySchema = z.object({
  id: z.number(),
  nome: z.string().min(1),
  cpf_cnpj: OptionalNullableStringSchema,
  pessoa_id: OptionalNullableNumberSchema,
  percentual: OptionalNullableNumberSchema,
  tipo_descricao: OptionalNullableStringSchema,
  sequencia: OptionalNullableNumberSchema,
  representante: OptionalNullableStringSchema,
  representante_id: OptionalNullableNumberSchema,
});

export const DocumentCreationAssetSchema = z.object({
  id: z.number(),
  descricao: z.string().min(1),
  matricula: OptionalNullableStringSchema,
  alienantes: z.array(DocumentCreationPartySchema).default([]),
  adquirentes: z.array(DocumentCreationPartySchema).default([]),
  vlr_alienacao: OptionalNullableNumberSchema,
  vlr_avaliacao: OptionalNullableNumberSchema,
});

export const DocumentCreationAtoSchema = z.object({
  id: z.number(),
  mne: OptionalNullableStringSchema,
  bens: z.array(DocumentCreationAssetSchema).default([]),
  token: OptionalNullableStringSchema,
  valor: OptionalNullableNumberSchema,
  status: OptionalNullableStringSchema,
  created: OptionalNullableStringSchema,
  pessoas: z.array(DocumentCreationPartySchema).default([]),
  user_id: OptionalNullableNumberSchema,
  excluido: z.boolean().optional(),
  link_ato: OptionalNullableStringSchema,
  livro_id: OptionalNullableNumberSchema,
  protocolo: OptionalNullableNumberSchema,
  codigo1_tj: OptionalNullableStringSchema,
  codigo2_tj: OptionalNullableStringSchema,
  grs_numero: OptionalNullableStringSchema,
  link_livro: OptionalNullableStringSchema,
  observacao: OptionalNullableStringSchema,
  valor_tsnr: OptionalNullableNumberSchema,
  ato_tipo_id: OptionalNullableNumberSchema,
  cartorio_id: OptionalNullableNumberSchema,
  dt_abertura: OptionalNullableStringSchema,
  folha_final: OptionalNullableNumberSchema,
  folha_total: OptionalNullableNumberSchema,
  texto_final: OptionalNullableStringSchema,
  valor_selos: OptionalNullableNumberSchema,
  dt_casamento: OptionalNullableStringSchema,
  dt_envio_doi: OptionalNullableStringSchema,
  dt_lavratura: OptionalNullableStringSchema,
  livro_numero: OptionalNullableNumberSchema,
  ordemserv_id: OptionalNullableNumberSchema,
  texto_minuta: OptionalNullableStringSchema,
  folha_inicial: OptionalNullableNumberSchema,
  dt_cancelamento: OptionalNullableStringSchema,
  dt_envio_consec: OptionalNullableStringSchema,
  user_alteracao_id: OptionalNullableNumberSchema,
  user_lavratura_id: OptionalNullableNumberSchema,
  valor_emolumentos: OptionalNullableNumberSchema,
  ato_tipo_descricao: OptionalNullableStringSchema,
  qtd_filhos_maiores: OptionalNullableNumberSchema,
  qtd_filhos_menores: OptionalNullableNumberSchema,
  motivo_cancelamento: OptionalNullableStringSchema,
  protocolo_provisorio: OptionalNullableStringSchema,
  responsavel_menores_id: OptionalNullableNumberSchema,
  tabvalores_regimecasamento_id: OptionalNullableNumberSchema,
});

export const DocumentCreationSupportingDocumentSchema = z.object({
  id: z.string().min(1),
  fileName: z.string().min(1).max(255),
  fileType: z.string().nullable(),
  fileSize: z.number().nonnegative(),
  content: z.string().min(1).max(50000),
});

export const CreateDocumentRequestSchema = z.object({
  ato: DocumentCreationAtoSchema,
  documents: z.array(DocumentCreationSupportingDocumentSchema).optional(),
  requesterInstructions: z.string().max(5000).optional(),
});

export const PreValidateDocumentConformityRequestSchema = CreateDocumentRequestSchema;

export const PostValidateDocumentConformityRequestSchema = CreateDocumentRequestSchema.extend({
  generatedContent: z.string().min(1).max(100000),
});

export type DocumentCreationPartyInput = z.infer<typeof DocumentCreationPartySchema>;
export type DocumentCreationAssetInput = z.infer<typeof DocumentCreationAssetSchema>;
export type DocumentCreationAtoInput = z.infer<typeof DocumentCreationAtoSchema>;
export type DocumentCreationSupportingDocumentInput = z.infer<typeof DocumentCreationSupportingDocumentSchema>;
export type CreateDocumentRequestInput = z.infer<typeof CreateDocumentRequestSchema>;
export type PreValidateDocumentConformityRequestInput = z.infer<typeof PreValidateDocumentConformityRequestSchema>;
export type PostValidateDocumentConformityRequestInput = z.infer<typeof PostValidateDocumentConformityRequestSchema>;
