import type { LinkedDocumentModel } from './document-model.types';

export const DOCUMENT_GENERATION_PROVIDERS = {
  STUB: 'stub',
} as const;

export type DocumentGenerationProvider = (typeof DOCUMENT_GENERATION_PROVIDERS)[keyof typeof DOCUMENT_GENERATION_PROVIDERS];

export type DocumentGenerationFieldValue = string | number | boolean | null;

export interface DocumentGenerationRequest {
  requesterInstructions?: string;
  inputValues?: Record<string, DocumentGenerationFieldValue>;
}

export interface DocumentGenerationWarning {
  code: string;
  message: string;
}

export interface DocumentGenerationResult {
  documentModelId: string;
  provider: DocumentGenerationProvider;
  model: string;
  title: string;
  content: string;
  linkedDocuments: LinkedDocumentModel[];
  warnings: DocumentGenerationWarning[];
  generatedAt: string;
}