import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Categoria } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private readonly api = inject(ApiService);

  private extractList(response: any): any[] {
    const list = response?.data ?? response?.categorias ?? response?.items ?? [];
    return Array.isArray(list) ? list : [];
  }

  private extractOne(response: any): any | null {
    return response?.data ?? response?.categoria ?? response?.item ?? response ?? null;
  }

  private mapCategoria(raw: any): Categoria {
    return {
      id: String(raw?.id ?? ''),
      nombre: String(raw?.nombre ?? ''),
      descripcion: raw?.descripcion ?? undefined
    };
  }

  getAll(): Observable<Categoria[]> {
    return this.api.get<any>('categorias').pipe(
      map((response: any) => this.extractList(response).map((item) => this.mapCategoria(item)))
    );
  }

  getById(id: string): Observable<Categoria | null> {
    return this.api.get<any>(`categorias/${id}`).pipe(
      map((response: any) => {
        const raw = this.extractOne(response);
        if (!raw) return null;
        return this.mapCategoria(raw);
      })
    );
  }

  create(payload: Partial<Categoria>): Observable<Categoria | null> {
    const body = {
      nombre: payload.nombre?.trim(),
      descripcion: payload.descripcion?.trim() || undefined
    };

    return this.api.post<any>('categorias', body).pipe(
      map((response: any) => {
        const raw = this.extractOne(response);
        if (!raw) return null;
        return this.mapCategoria(raw);
      })
    );
  }

  update(id: string, payload: Partial<Categoria>): Observable<Categoria | null> {
    const body = {
      nombre: payload.nombre?.trim(),
      descripcion: payload.descripcion?.trim() || undefined
    };

    return this.api.put<any>(`categorias/${id}`, body).pipe(
      map((response: any) => {
        const raw = this.extractOne(response);
        if (!raw) return null;
        return this.mapCategoria(raw);
      })
    );
  }

  delete(id: string): Observable<boolean> {
    return this.api.delete<unknown>(`categorias/${id}`).pipe(map(() => true));
  }
}
