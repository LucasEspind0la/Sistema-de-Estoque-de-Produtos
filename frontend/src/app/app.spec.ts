import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { App } from './app';
import { Movimentacao } from './movimentacao.model';
import { Produto } from './produto.model';

const PRODUTOS = 'http://localhost:8080/produtos';
const MOVIMENTACOES = 'http://localhost:8080/movimentacoes';

const produtos: Produto[] = [{ id: 1, nome: 'Teclado', preco: 129.9, quantidade: 0 }];

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let http: HttpTestingController;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(App);
    el = fixture.nativeElement;

    fixture.detectChanges();
    http.expectOne({ method: 'GET', url: PRODUTOS }).flush(produtos);
    http.expectOne({ method: 'GET', url: MOVIMENTACOES }).flush([]);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  function linhasDe(secao: string): HTMLTableRowElement[] {
    return Array.from(el.querySelectorAll<HTMLTableRowElement>(`${secao} tbody tr`));
  }

  it('mostra o título e as três seções da página', () => {
    expect(el.querySelector('h1')?.textContent).toContain('Sistema de Estoque');
    expect(el.querySelector('app-produto-form')).not.toBeNull();
    expect(el.querySelector('app-produto-lista')).not.toBeNull();
    expect(el.querySelector('app-movimentacao-lista')).not.toBeNull();
  });

  it('atualiza o histórico depois de uma entrada', async () => {
    expect(el.querySelector('app-movimentacao-lista')?.textContent).toContain(
      'Nenhuma movimentação registrada.',
    );

    const linha = linhasDe('app-produto-lista')[0];
    linha.querySelector<HTMLInputElement>('input')!.value = '10';
    Array.from(linha.querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === 'Entrada')!
      .click();

    http
      .expectOne({ method: 'POST', url: `${PRODUTOS}/1/entrada` })
      .flush({ id: 1, nome: 'Teclado', preco: 129.9, quantidade: 10 });

    const novo: Movimentacao[] = [
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
    http.expectOne({ method: 'GET', url: MOVIMENTACOES }).flush(novo);
    await fixture.whenStable();

    const historico = linhasDe('app-movimentacao-lista');
    expect(historico.length).toBe(1);
    expect(historico[0].textContent).toContain('Entrada');
  });

  it('atualiza a lista de produtos depois de cadastrar um produto novo', async () => {
    const campoNome = el.querySelector<HTMLInputElement>('input[name="nome"]')!;
    const campoPreco = el.querySelector<HTMLInputElement>('input[name="preco"]')!;
    campoNome.value = 'Mouse';
    campoNome.dispatchEvent(new Event('input'));
    campoPreco.value = '59.9';
    campoPreco.dispatchEvent(new Event('input'));
    el.querySelector('form')!.dispatchEvent(new Event('submit'));

    const mouse: Produto = { id: 2, nome: 'Mouse', preco: 59.9, quantidade: 0 };
    http.expectOne({ method: 'POST', url: PRODUTOS }).flush(mouse);
    http.expectOne({ method: 'GET', url: PRODUTOS }).flush([...produtos, mouse]);
    await fixture.whenStable();

    const linhas = linhasDe('app-produto-lista');
    expect(linhas.length).toBe(2);
    expect(linhas[1].textContent).toContain('Mouse');
  });
});
