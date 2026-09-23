export type ExternalTextEditorLanguage = 'text' | 'markdown' | 'html' | 'json' | 'xml';

export interface ExternalTextEditorLoadRequest {
  documentModelId: string | null;
  title: string;
  content: string;
  language: ExternalTextEditorLanguage;
}

export interface ExternalTextEditorSession {
  sessionId: string;
  status: 'stub';
  content: string;
  message: string;
  loadedAt: string;
}