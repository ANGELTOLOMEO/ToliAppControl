import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models';

/**
 * ApiService base para realizar peticiones HTTP al backend
 * Proveé métodos genéricos: get, post, put, delete
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.API_URL;

  private extractServerMessage(error: any): string | undefined {
    const payload = error?.error;
    if (!payload) return undefined;
    if (typeof payload === 'string') return payload;
    return payload.message || payload.error || payload.detail || payload.mensaje;
  }

  /**
   * Realiza una petición GET
   */
  get<T>(endpoint: string, params?: Record<string, string | number>): Observable<ApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, { params: httpParams }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Realiza una petición POST
   */
  post<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Realiza una petición PUT
   */
  put<T>(endpoint: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Realiza una petición DELETE
   */
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = error.error.message;
    } else {
      // Error del lado del servidor
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else if (error.status === 401) {
        errorMessage = this.extractServerMessage(error) || 'No autorizado';
      } else if (error.status === 403) {
        errorMessage = this.extractServerMessage(error) || 'Acceso prohibido';
      } else if (error.status === 404) {
        errorMessage = this.extractServerMessage(error) || 'Recurso no encontrado';
      } else if (error.status === 500) {
        errorMessage = this.extractServerMessage(error) || 'Error interno del servidor';
      } else {
        errorMessage = this.extractServerMessage(error) || `Error ${error.status}`;
      }
    }

    console.error('API Error:', errorMessage, error);
    throw new Error(errorMessage);
  }
}
