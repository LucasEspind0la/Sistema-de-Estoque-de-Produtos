import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Movimentacao } from './movimentacao.model';
import { Produto } from './produto.model';

@Injectable({ providedIn: 'root' })
export class ProdutoApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080';
  private readonly url = `${this.baseUrl}/produtos`;

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.url);
  }

  cadastrar(nome: string, preco: number): Observable<Produto> {
    return this.http.post<Produto>(this.url, { nome, preco });
  }

  entrada(id: number, quantidade: number): Observable<Produto> {
    return this.http.post<Produto>(`${this.url}/${id}/entrada`, { quantidade });
  }

  saida(id: number, quantidade: number): Observable<Produto> {
    return this.http.post<Produto>(`${this.url}/${id}/saida`, { quantidade });
  }

  listarMovimentacoes(): Observable<Movimentacao[]> {
    return this.http.get<Movimentacao[]>(`${this.baseUrl}/movimentacoes`);
  }
}
