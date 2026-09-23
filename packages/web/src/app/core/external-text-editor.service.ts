import { Injectable, InjectionToken, inject } from '@angular/core';
import type { ExternalTextEditorLoadRequest, ExternalTextEditorSession } from '@app001/shared';

export interface ExternalTextEditorLoader {
  loadEditor(request: ExternalTextEditorLoadRequest): Promise<ExternalTextEditorSession>;
}

@Injectable({ providedIn: 'root' })
export class StubExternalTextEditorService implements ExternalTextEditorLoader {
  async loadEditor(request: ExternalTextEditorLoadRequest): Promise<ExternalTextEditorSession> {
    return {
      sessionId: `stub-editor-${Date.now()}`,
      status: 'stub',
      content: request.content,
      message: 'External editor loader stub is active. The inline editor remains in use.',
      loadedAt: new Date().toISOString(),
    };
  }
}

export const EXTERNAL_TEXT_EDITOR_LOADER = new InjectionToken<ExternalTextEditorLoader>('EXTERNAL_TEXT_EDITOR_LOADER', {
  providedIn: 'root',
  factory: () => inject(StubExternalTextEditorService),
});