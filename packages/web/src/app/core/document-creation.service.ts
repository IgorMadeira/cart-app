import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  API_ROUTES,
  type ApiResponse,
  type CreateDocumentRequest,
  type CreateDocumentResult,
  type DocumentConformityResult,
  type PostValidateDocumentConformityRequest,
  type PreValidateDocumentConformityRequest,
} from '@app001/shared';

@Injectable({ providedIn: 'root' })
export class DocumentCreationService {
  private http = inject(HttpClient);

  generateDocument(data: CreateDocumentRequest): Observable<ApiResponse<CreateDocumentResult>> {
    return this.http.post<ApiResponse<CreateDocumentResult>>(API_ROUTES.DOCUMENTS.GENERATE, data);
  }

  preValidateConformity(data: PreValidateDocumentConformityRequest): Observable<ApiResponse<DocumentConformityResult>> {
    return this.http.post<ApiResponse<DocumentConformityResult>>(API_ROUTES.DOCUMENTS.PRE_VALIDATE_CONFORMITY, data);
  }

  postValidateConformity(data: PostValidateDocumentConformityRequest): Observable<ApiResponse<DocumentConformityResult>> {
    return this.http.post<ApiResponse<DocumentConformityResult>>(API_ROUTES.DOCUMENTS.POST_VALIDATE_CONFORMITY, data);
  }
}
