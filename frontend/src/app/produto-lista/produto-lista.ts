import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, output, signal } from '@angular/core';

import { ProdutoApi } from '../produto-api';
import { Produto } from '../produto.model';

type TipoMovimento = 'entrada' | 'saida';

@Component({
  selector: 'app-produto-lista',
  imports: [CurrencyPipe],
  templateUrl: './produto-lista.html',
  styleUrl: './produto-lista.css',
})
export class ProdutoLista implements OnInit {
  private readonly api = inject(ProdutoApi);

  readonly movimentado = output<void>();

  protected readonly produtos = signal<Produto[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  protected readonly erroMovimento = signal<string | null>(null);
  protected readonly sucessoMovimento = signal<string | null>(null);

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

  protected movimentar(produto: Produto, tipo: TipoMovimento, campo: HTMLInputElement): void {
    this.erroMovimento.set(null);
    this.sucessoMovimento.set(null);

    if (campo.value.trim() === '') {
      this.erroMovimento.set('Informe a quantidade.');
      return;
    }

    const quantidade = Number(campo.value);
    if (!Number.isInteger(quantidade)) {
      this.erroMovimento.set('A quantidade deve ser um número inteiro.');
      return;
    }

    const chamada =
      tipo === 'entrada'
        ? this.api.entrada(produto.id, quantidade)
        : this.api.saida(produto.id, quantidade);

    chamada.subscribe({
      next: (atualizado) => {
        this.produtos.update((lista) =>
          lista.map((p) => (p.id === atualizado.id ? atualizado : p)),
        );
        const acao = tipo === 'entrada' ? 'Entrada' : 'Saída';
        this.sucessoMovimento.set(
          `${acao} de ${quantidade} em "${atualizado.nome}". Saldo atual: ${atualizado.quantidade}.`,
        );
        campo.value = '';
        this.movimentado.emit();
      },
      error: (e: HttpErrorResponse) => {
        this.erroMovimento.set(e.error?.erro ?? 'Não foi possível registrar a movimentação.');
      },
    });
  }
}
