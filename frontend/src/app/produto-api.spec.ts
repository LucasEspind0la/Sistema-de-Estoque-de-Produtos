import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Movimentacao } from './movimentacao.model';
import { ProdutoApi } from './produto-api';
import { Produto } from './produto.model';

const URL = 'http://localhost:8080';

describe('ProdutoApi', () => {
  let api: ProdutoApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ProdutoApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lista os produtos com GET /produtos', () => {
    const esperado: Produto[] = [{ id: 1, nome: 'Teclado', preco: 129.9, quantidade: 0 }];
    let recebido: Produto[] | undefined;

    api.listar().subscribe((lista) => (recebido = lista));

    const req = http.expectOne(`${URL}/produtos`);
    expect(req.request.method).toBe('GET');
    req.flush(esperado);

    expect(recebido).toEqual(esperado);
  });

  it('cadastra um produto com POST /produtos enviando nome e preço', () => {
    api.cadastrar('Mouse', 59.9).subscribe();

    const req = http.expectOne(`${URL}/produtos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nome: 'Mouse', preco: 59.9 });
    req.flush({ id: 2, nome: 'Mouse', preco: 59.9, quantidade: 0 });
  });

  it('registra uma entrada com POST /produtos/{id}/entrada', () => {
    api.entrada(1, 10).subscribe();

    const req = http.expectOne(`${URL}/produtos/1/entrada`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ quantidade: 10 });
    req.flush({ id: 1, nome: 'Teclado', preco: 129.9, quantidade: 10 });
  });

  it('registra uma saída com POST /produtos/{id}/saida', () => {
    api.saida(1, 3).subscribe();

    const req = http.expectOne(`${URL}/produtos/1/saida`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ quantidade: 3 });
    req.flush({ id: 1, nome: 'Teclado', preco: 129.9, quantidade: 7 });
  });

  it('lista o histórico com GET /movimentacoes', () => {
    const esperado: Movimentacao[] = [
      {
        id: 1,
        produtoId: 1,
        produtoNome: 'Teclado',
        tipo: 'ENTRADA',
        quantidade: 10,
        saldoApos: 10,
        dataHora: '2026-11-09T23:20:34.251664Z',
      },
    ];
    let recebido: Movimentacao[] | undefined;

    api.listarMovimentacoes().subscribe((lista) => (recebido = lista));

    const req = http.expectOne(`${URL}/movimentacoes`);
    expect(req.request.method).toBe('GET');
    req.flush(esperado);

    expect(recebido).toEqual(esperado);
  });
});
