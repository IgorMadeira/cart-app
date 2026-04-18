import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { ApiResponse, AuthResponse, User } from '@app001/shared';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  login(email: string, password: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>('/api/auth/login', { email, password });
  }

  register(email: string, password: string, name: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>('/api/auth/register', { email, password, name });
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>('/api/auth/refresh', {});
  }

  getMe(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>('/api/auth/me');
  }

  logout(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>('/api/auth/logout', {});
  }
}
