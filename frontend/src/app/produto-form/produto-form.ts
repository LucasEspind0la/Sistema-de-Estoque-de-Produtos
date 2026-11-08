import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ProdutoApi } from '../produto-api';

@Component({
  selector: 'app-produto-form',
  imports: [FormsModule],
  templateUrl: './produto-form.html',
  styleUrl: './produto-form.css',
})
export class ProdutoForm {
  private readonly api = inject(ProdutoApi);

  readonly cadastrado = output<void>();

  protected readonly nome = signal('');
  protected readonly preco = signal<number | null>(null);

  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly sucesso = signal<string | null>(null);

  protected cadastrar(): void {
    const preco = this.preco();
    if (preco === null) {
      this.sucesso.set(null);
      this.erro.set('Informe o preço.');
      return;
    }

    this.enviando.set(true);
    this.erro.set(null);
    this.sucesso.set(null);

    this.api.cadastrar(this.nome().trim(), preco).subscribe({
      next: (produto) => {
        this.sucesso.set(`Produto "${produto.nome}" cadastrado (id ${produto.id}).`);
        this.nome.set('');
        this.preco.set(null);
        this.enviando.set(false);
        this.cadastrado.emit();
      },
      error: (e: HttpErrorResponse) => {
        this.erro.set(e.error?.erro ?? 'Não foi possível cadastrar o produto.');
        this.enviando.set(false);
      },
    });
  }
}
