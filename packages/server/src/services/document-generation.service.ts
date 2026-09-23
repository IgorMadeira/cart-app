import {
  DOCUMENT_GENERATION_PROVIDERS,
  type DocumentGenerationRequestInput,
  type DocumentGenerationResult,
  type DocumentGenerationWarning,
  type DocumentModel,
} from '@app001/shared';
import { getDocumentById } from './document-model.service';

const STUB_MODEL = 'stub-document-generator';

interface DocumentGenerationProvider {
  generate(documentModel: DocumentModel, request: DocumentGenerationRequestInput): Promise<DocumentGenerationResult>;
}

function getTextOrFallback(value: string | null, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function formatInputValues(request: DocumentGenerationRequestInput): string[] {
  if (!request.inputValues) return ['- Nenhum dado complementar informado.'];

  const entries = Object.entries(request.inputValues);
  if (entries.length === 0) return ['- Nenhum dado complementar informado.'];

  return entries.map(([key, value]) => `- ${key}: ${value === null ? 'não informado' : String(value)}`);
}

function formatLinkedDocuments(documentModel: DocumentModel): string[] {
  if (documentModel.linkedDocuments.length === 0) {
    return ['- Nenhum modelo vinculado.'];
  }

  return documentModel.linkedDocuments.map((linkedDocument) => {
    const category = linkedDocument.categoryName ?? 'sem categoria';
    return `- ${linkedDocument.title} (${category})`;
  });
}

function collectWarnings(documentModel: DocumentModel): DocumentGenerationWarning[] {
  const warnings: DocumentGenerationWarning[] = [];

  if (!documentModel.aiEnabled) {
    warnings.push({
      code: 'AI_DISABLED',
      message: 'AI generation is not enabled for this Document Model.',
    });
  }

  if (!documentModel.content?.trim()) {
    warnings.push({
      code: 'MISSING_TEMPLATE_CONTENT',
      message: 'The Document Model has no base content.',
    });
  }

  if (!documentModel.aiInstructions?.trim()) {
    warnings.push({
      code: 'MISSING_AI_INSTRUCTIONS',
      message: 'The Document Model has no AI creation instructions.',
    });
  }

  if (!documentModel.legislationRules?.trim()) {
    warnings.push({
      code: 'MISSING_LEGISLATION_RULES',
      message: 'The Document Model has no legislation rules.',
    });
  }

  return warnings;
}

function buildStubContent(documentModel: DocumentModel, request: DocumentGenerationRequestInput): string {
  const requesterInstructions = request.requesterInstructions?.trim() || 'Nenhuma instrução adicional informada.';

  return [
    `Documento padronizado: ${documentModel.title}`,
    '',
    'Conteúdo base do modelo:',
    getTextOrFallback(documentModel.content, '[Sem conteúdo base cadastrado.]'),
    '',
    'Instruções para IA:',
    getTextOrFallback(documentModel.aiInstructions, '[Sem instruções de IA cadastradas.]'),
    '',
    'Regras de legislação:',
    getTextOrFallback(documentModel.legislationRules, '[Sem regras de legislação cadastradas.]'),
    '',
    'Documentos vinculados:',
    ...formatLinkedDocuments(documentModel),
    '',
    'Dados complementares:',
    ...formatInputValues(request),
    '',
    'Instruções adicionais da solicitação:',
    requesterInstructions,
    '',
    'Resultado gerado por stub local. Nenhuma chamada externa de IA foi executada.',
  ].join('\n');
}

const stubDocumentGenerationProvider = {
  async generate(documentModel, request) {
    return {
      documentModelId: documentModel.id,
      provider: DOCUMENT_GENERATION_PROVIDERS.STUB,
      model: STUB_MODEL,
      title: documentModel.title,
      content: buildStubContent(documentModel, request),
      linkedDocuments: documentModel.linkedDocuments,
      warnings: collectWarnings(documentModel),
      generatedAt: new Date().toISOString(),
    };
  },
} satisfies DocumentGenerationProvider;

export async function generateDocumentFromModel(
  documentModelId: string,
  request: DocumentGenerationRequestInput,
): Promise<DocumentGenerationResult> {
  const documentModel = await getDocumentById(documentModelId);
  return stubDocumentGenerationProvider.generate(documentModel, request);
}