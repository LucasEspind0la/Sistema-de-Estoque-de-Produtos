import { Component } from '@angular/core';

import { MovimentacaoLista } from './movimentacao-lista/movimentacao-lista';
import { ProdutoForm } from './produto-form/produto-form';
import { ProdutoLista } from './produto-lista/produto-lista';

@Component({
  selector: 'app-root',
  imports: [ProdutoForm, ProdutoLista, MovimentacaoLista],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
