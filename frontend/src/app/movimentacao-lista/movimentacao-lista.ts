import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { Movimentacao } from '../movimentacao.model';
import { ProdutoApi } from '../produto-api';

@Component({
  selector: 'app-movimentacao-lista',
  imports: [DatePipe],
  templateUrl: './movimentacao-lista.html',
  styleUrl: './movimentacao-lista.css',
})
export class MovimentacaoLista implements OnInit {
  private readonly api = inject(ProdutoApi);

  protected readonly movimentacoes = signal<Movimentacao[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.erro.set(null);

    this.api.listarMovimentacoes().subscribe({
      next: (lista) => {
        this.movimentacoes.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o histórico. A API está rodando?');
        this.carregando.set(false);
      },
    });
  }
}
