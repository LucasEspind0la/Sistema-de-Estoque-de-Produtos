import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { ProdutoApi } from '../produto-api';
import { Produto } from '../produto.model';

@Component({
  selector: 'app-produto-lista',
  imports: [CurrencyPipe],
  templateUrl: './produto-lista.html',
  styleUrl: './produto-lista.css',
})
export class ProdutoLista implements OnInit {
  private readonly api = inject(ProdutoApi);

  protected readonly produtos = signal<Produto[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.api.listar().subscribe({
      next: (lista) => {
        this.produtos.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os produtos. A API está rodando?');
        this.carregando.set(false);
      },
    });
  }
}
