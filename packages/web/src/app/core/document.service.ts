import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import type {
  ApiResponse,
  PaginatedResponse,
  DocumentModel,
  DocumentModelListItem,
  Category,
  Tag,
} from '@app001/shared';

@Injectable({ providedIn: 'root' })
export class DocumentModelService {
  private http = inject(HttpClient);

  listDocuments(params: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
    categoryId?: string;
    tagId?: string;
    search?: string;
  }): Observable<ApiResponse<PaginatedResponse<DocumentModelListItem>>> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return this.http.get<ApiResponse<PaginatedResponse<DocumentModelListItem>>>('/api/document-models', { params: httpParams });
  }

  getDocument(id: string): Observable<ApiResponse<DocumentModel>> {
    return this.http.get<ApiResponse<DocumentModel>>(`/api/document-models/${id}`);
  }

  createDocument(formData: FormData): Observable<ApiResponse<DocumentModel>> {
    return this.http.post<ApiResponse<DocumentModel>>('/api/document-models', formData);
  }

  updateDocument(id: string, formData: FormData): Observable<ApiResponse<DocumentModel>> {
    return this.http.patch<ApiResponse<DocumentModel>>(`/api/document-models/${id}`, formData);
  }

  deleteDocument(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/api/document-models/${id}`);
  }

  downloadDocument(id: string): Observable<Blob> {
    return this.http.get(`/api/document-models/${id}/download`, { responseType: 'blob' });
  }

  // Categories
  listCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>('/api/categories');
  }

  createCategory(data: { name: string; description?: string }): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>('/api/categories', data);
  }

  updateCategory(id: string, data: { name?: string; description?: string }): Observable<ApiResponse<Category>> {
    return this.http.patch<ApiResponse<Category>>(`/api/categories/${id}`, data);
  }

  deleteCategory(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/api/categories/${id}`);
  }

  // Tags
  listTags(): Observable<ApiResponse<Tag[]>> {
    return this.http.get<ApiResponse<Tag[]>>('/api/tags');
  }

  createTag(data: { name: string }): Observable<ApiResponse<Tag>> {
    return this.http.post<ApiResponse<Tag>>('/api/tags', data);
  }

  deleteTag(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/api/tags/${id}`);
  }
}
