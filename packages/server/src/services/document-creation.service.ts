import {
  DOCUMENT_GENERATION_PROVIDERS,
  type CreateDocumentRequestInput,
  type CreateDocumentResult,
  type DocumentConformityCheck,
  type DocumentConformityPhase,
  type DocumentConformityResult,
  type DocumentConformityStatus,
  type DocumentCreationAssetInput,
  type DocumentCreationPartyInput,
  type DocumentCreationSupportingDocumentInput,
  type DocumentGenerationWarning,
  type PostValidateDocumentConformityRequestInput,
  type PreValidateDocumentConformityRequestInput,
} from '@app001/shared';

const STUB_CREATE_DOCUMENT_MODEL = 'stub-ai-create-document-from-ato';
const STUB_PRE_VALIDATION_MODEL = 'stub-ai-pre-conformity-validator';
const STUB_POST_VALIDATION_MODEL = 'stub-ai-post-conformity-validator';
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function getTextOrFallback(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'não informado';
  return currencyFormatter.format(value);
}

function formatOptionalNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'não informado';
  return String(value);
}

function formatPartyRow(party: DocumentCreationPartyInput): string {
  const documentNumber = getTextOrFallback(party.cpf_cnpj, 'CPF/CNPJ não informado');
  const role = getTextOrFallback(party.tipo_descricao, 'qualificação não informada');
  const percentage = party.percentual === null || party.percentual === undefined
    ? ''
    : `, percentual ${party.percentual}%`;

  return `- ${party.nome} (${documentNumber}, ${role}${percentage})`;
}

function formatPartyRows(parties: DocumentCreationPartyInput[], fallback: string): string[] {
  if (parties.length === 0) return [`- ${fallback}`];
  return parties.map(formatPartyRow);
}

function buildAssetLines(assets: DocumentCreationAssetInput[]): string[] {
  if (assets.length === 0) return ['Bens:', '- Nenhum bem informado.'];

  const lines: string[] = ['Bens:'];

  for (const asset of assets) {
    lines.push(
      '',
      `Bem ${asset.id}:`,
      asset.descricao,
      `Matrícula: ${getTextOrFallback(asset.matricula, 'não informada')}`,
      `Valor de alienação: ${formatCurrency(asset.vlr_alienacao)}`,
      `Valor de avaliação: ${formatCurrency(asset.vlr_avaliacao)}`,
      'Alienantes:',
      ...formatPartyRows(asset.alienantes, 'Nenhum alienante informado para este bem.'),
      'Adquirentes:',
      ...formatPartyRows(asset.adquirentes, 'Nenhum adquirente informado para este bem.'),
    );
  }

  return lines;
}

function buildPeopleLines(parties: DocumentCreationPartyInput[]): string[] {
  return [
    'Pessoas do ato:',
    ...formatPartyRows(parties, 'Nenhuma pessoa informada no ato.'),
  ];
}

function buildAtoSummaryLines(request: CreateDocumentRequestInput): string[] {
  const ato = request.ato;

  return [
    'Resumo do ato:',
    `- Identificador: ${ato.id}`,
    `- Token: ${getTextOrFallback(ato.token, 'não informado')}`,
    `- Tipo: ${getTextOrFallback(ato.ato_tipo_descricao, 'não informado')}`,
    `- Status: ${getTextOrFallback(ato.status, 'não informado')}`,
    `- Protocolo: ${formatOptionalNumber(ato.protocolo)}`,
    `- Livro: ${formatOptionalNumber(ato.livro_numero)}`,
    `- Folhas: ${formatOptionalNumber(ato.folha_inicial)} a ${formatOptionalNumber(ato.folha_final)}`,
    `- Data de criação: ${getTextOrFallback(ato.created, 'não informada')}`,
    `- Data de lavratura: ${getTextOrFallback(ato.dt_lavratura, 'não informada')}`,
    `- Observação: ${getTextOrFallback(ato.observacao, 'sem observação')}`,
  ];
}

function buildFinancialLines(request: CreateDocumentRequestInput): string[] {
  const ato = request.ato;

  return [
    'Valores:',
    `- Valor do ato: ${formatCurrency(ato.valor)}`,
    `- Emolumentos: ${formatCurrency(ato.valor_emolumentos)}`,
    `- Selos: ${formatCurrency(ato.valor_selos)}`,
    `- TSNR: ${formatCurrency(ato.valor_tsnr)}`,
  ];
}

function buildSupportingDocumentLines(documents: DocumentCreationSupportingDocumentInput[] | undefined): string[] {
  if (!documents || documents.length === 0) {
    return ['Documentos de apoio:', '- Nenhum documento de apoio informado.'];
  }

  const lines: string[] = ['Documentos de apoio:'];

  for (const document of documents) {
    const excerpt = document.content.length > 600
      ? `${document.content.slice(0, 600)}...`
      : document.content;

    lines.push(
      '',
      `Arquivo: ${document.fileName}`,
      `Tipo informado pelo navegador: ${getTextOrFallback(document.fileType, 'não informado')}`,
      `Tamanho: ${document.fileSize} bytes`,
      excerpt,
    );
  }

  return lines;
}

function collectWarnings(request: CreateDocumentRequestInput): DocumentGenerationWarning[] {
  const warnings: DocumentGenerationWarning[] = [];
  const hasAlienantes = request.ato.bens.some((asset) => asset.alienantes.length > 0);
  const hasAdquirentes = request.ato.bens.some((asset) => asset.adquirentes.length > 0);

  if (request.ato.bens.length === 0) {
    warnings.push({ code: 'MISSING_ASSETS', message: 'The ato has no bens data.' });
  }

  if (request.ato.pessoas.length === 0) {
    warnings.push({ code: 'MISSING_PEOPLE', message: 'The ato has no pessoas data.' });
  }

  if (!hasAlienantes) {
    warnings.push({ code: 'MISSING_SELLERS', message: 'No alienantes were found in the ato bens.' });
  }

  if (!hasAdquirentes) {
    warnings.push({ code: 'MISSING_BUYERS', message: 'No adquirentes were found in the ato bens.' });
  }

  if (!request.requesterInstructions?.trim()) {
    warnings.push({ code: 'MISSING_REQUESTER_INSTRUCTIONS', message: 'No additional creation instructions were provided.' });
  }

  if (!request.documents || request.documents.length === 0) {
    warnings.push({ code: 'MISSING_SUPPORTING_DOCUMENTS', message: 'No supporting documents were provided.' });
  }

  return warnings;
}

function buildStubContent(request: CreateDocumentRequestInput): string {
  const title = getTextOrFallback(request.ato.ato_tipo_descricao, 'DOCUMENTO CARTORIAL');
  const instructions = request.requesterInstructions?.trim() || 'Nenhuma instrução adicional informada.';

  return [
    `Minuta gerada: ${title}`,
    '',
    ...buildAtoSummaryLines(request),
    '',
    ...buildPeopleLines(request.ato.pessoas),
    '',
    ...buildAssetLines(request.ato.bens),
    '',
    ...buildFinancialLines(request),
    '',
    ...buildSupportingDocumentLines(request.documents),
    '',
    'Instruções adicionais:',
    instructions,
    '',
    'Conteúdo gerado por stub de IA local. Nenhuma chamada externa de IA foi executada.',
  ].join('\n');
}

export async function generateCreateDocumentContent(request: CreateDocumentRequestInput): Promise<CreateDocumentResult> {
  const title = `Minuta de ${getTextOrFallback(request.ato.ato_tipo_descricao, 'documento')}`;

  return {
    provider: DOCUMENT_GENERATION_PROVIDERS.STUB,
    model: STUB_CREATE_DOCUMENT_MODEL,
    title,
    content: buildStubContent(request),
    warnings: collectWarnings(request),
    sourceAtoId: request.ato.id,
    token: request.ato.token ?? null,
    atoTipoDescricao: request.ato.ato_tipo_descricao ?? null,
    generatedAt: new Date().toISOString(),
  };
}

function createConformityCheck(
  code: string,
  label: string,
  status: 'passed' | 'attention' | 'failed',
  message: string,
): DocumentConformityCheck {
  return { code, label, status, message };
}

function getConformityStatus(checks: DocumentConformityCheck[]): DocumentConformityStatus {
  for (const check of checks) {
    if (check.status === 'failed') return 'blocked';
  }

  for (const check of checks) {
    if (check.status === 'attention') return 'attention_required';
  }

  return 'conformant';
}

function normalizeText(value: string): string {
  return value.toLocaleLowerCase('pt-BR');
}

function containsText(content: string, value: string | null | undefined): boolean {
  const trimmed = value?.trim();
  if (!trimmed) return false;
  return normalizeText(content).includes(normalizeText(trimmed));
}

function contentReferencesAnyParty(content: string, parties: DocumentCreationPartyInput[]): boolean {
  for (const party of parties) {
    if (containsText(content, party.nome)) return true;
  }

  return false;
}

function contentReferencesAnyAsset(content: string, assets: DocumentCreationAssetInput[]): boolean {
  for (const asset of assets) {
    if (containsText(content, `Bem ${asset.id}`)) return true;

    const descriptionExcerpt = asset.descricao.trim().slice(0, 32);
    if (containsText(content, descriptionExcerpt)) return true;
  }

  return false;
}

function buildBaseConformityChecks(request: CreateDocumentRequestInput): DocumentConformityCheck[] {
  const hasAssets = request.ato.bens.length > 0;
  const hasPeople = request.ato.pessoas.length > 0;
  const hasSellers = request.ato.bens.some((asset) => asset.alienantes.length > 0);
  const hasBuyers = request.ato.bens.some((asset) => asset.adquirentes.length > 0);
  const supportingDocuments = request.documents ?? [];

  return [
    createConformityCheck(
      'ASSETS_PRESENT',
      'Bens informados',
      hasAssets ? 'passed' : 'failed',
      hasAssets ? 'O ato possui bens para compor a minuta.' : 'O ato não possui bens informados.',
    ),
    createConformityCheck(
      'PEOPLE_PRESENT',
      'Pessoas informadas',
      hasPeople ? 'passed' : 'failed',
      hasPeople ? 'O ato possui pessoas vinculadas.' : 'O ato não possui pessoas vinculadas.',
    ),
    createConformityCheck(
      'SELLERS_PRESENT',
      'Alienantes identificados',
      hasSellers ? 'passed' : 'failed',
      hasSellers ? 'Há alienantes vinculados aos bens.' : 'Nenhum alienante foi encontrado nos bens.',
    ),
    createConformityCheck(
      'BUYERS_PRESENT',
      'Adquirentes identificados',
      hasBuyers ? 'passed' : 'failed',
      hasBuyers ? 'Há adquirentes vinculados aos bens.' : 'Nenhum adquirente foi encontrado nos bens.',
    ),
    createConformityCheck(
      'SUPPORTING_DOCUMENTS_PRESENT',
      'Documentos de apoio',
      supportingDocuments.length > 0 ? 'passed' : 'attention',
      supportingDocuments.length > 0
        ? `${supportingDocuments.length} documento(s) de apoio foram anexados ao contexto.`
        : 'Nenhum documento de apoio foi anexado ao contexto.',
    ),
  ];
}

function buildPreValidationChecks(request: PreValidateDocumentConformityRequestInput): DocumentConformityCheck[] {
  return [
    ...buildBaseConformityChecks(request),
    createConformityCheck(
      'AI_CONTEXT_READY',
      'Contexto para IA',
      'passed',
      'A chamada de validação prévia foi encaminhada ao provider de IA stubado.',
    ),
  ];
}

function buildPostValidationChecks(request: PostValidateDocumentConformityRequestInput): DocumentConformityCheck[] {
  const content = request.generatedContent.trim();
  const referencesAtoType = containsText(content, request.ato.ato_tipo_descricao);
  const referencesParty = contentReferencesAnyParty(content, request.ato.pessoas);
  const referencesAsset = contentReferencesAnyAsset(content, request.ato.bens);

  return [
    ...buildBaseConformityChecks(request),
    createConformityCheck(
      'GENERATED_CONTENT_PRESENT',
      'Conteúdo gerado',
      content ? 'passed' : 'failed',
      content ? 'Há conteúdo gerado para revisão pós-criação.' : 'A pós-validação exige conteúdo gerado.',
    ),
    createConformityCheck(
      'CONTENT_REFERENCES_ATO_TYPE',
      'Tipo do ato refletido na minuta',
      referencesAtoType ? 'passed' : 'attention',
      referencesAtoType
        ? 'O conteúdo gerado menciona o tipo do ato.'
        : 'O conteúdo gerado não menciona claramente o tipo do ato.',
    ),
    createConformityCheck(
      'CONTENT_REFERENCES_PARTIES',
      'Partes refletidas na minuta',
      referencesParty ? 'passed' : 'attention',
      referencesParty
        ? 'O conteúdo gerado menciona ao menos uma pessoa vinculada ao ato.'
        : 'O conteúdo gerado não menciona claramente as partes do ato.',
    ),
    createConformityCheck(
      'CONTENT_REFERENCES_ASSETS',
      'Bens refletidos na minuta',
      referencesAsset ? 'passed' : 'attention',
      referencesAsset
        ? 'O conteúdo gerado menciona ao menos um bem vinculado ao ato.'
        : 'O conteúdo gerado não menciona claramente os bens do ato.',
    ),
  ];
}

function buildConformityResult(
  phase: DocumentConformityPhase,
  model: string,
  checks: DocumentConformityCheck[],
  request: CreateDocumentRequestInput,
): DocumentConformityResult {
  return {
    provider: DOCUMENT_GENERATION_PROVIDERS.STUB,
    model,
    phase,
    status: getConformityStatus(checks),
    checks,
    warnings: collectWarnings(request),
    validatedAt: new Date().toISOString(),
  };
}

export async function preValidateDocumentConformity(
  request: PreValidateDocumentConformityRequestInput,
): Promise<DocumentConformityResult> {
  const checks = buildPreValidationChecks(request);
  return buildConformityResult('pre_creation', STUB_PRE_VALIDATION_MODEL, checks, request);
}

export async function postValidateDocumentConformity(
  request: PostValidateDocumentConformityRequestInput,
): Promise<DocumentConformityResult> {
  const checks = buildPostValidationChecks(request);
  return buildConformityResult('post_creation', STUB_POST_VALIDATION_MODEL, checks, request);
}
