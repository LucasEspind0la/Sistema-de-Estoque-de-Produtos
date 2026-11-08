import { Component } from '@angular/core';

import { ProdutoForm } from './produto-form/produto-form';
import { ProdutoLista } from './produto-lista/produto-lista';

@Component({
  selector: 'app-root',
  imports: [ProdutoForm, ProdutoLista],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
