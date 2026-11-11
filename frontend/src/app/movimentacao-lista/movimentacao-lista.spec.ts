import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Movimentacao } from '../movimentacao.model';
import { MovimentacaoLista } from './movimentacao-lista';

const URL = 'http://localhost:8080/movimentacoes';

const movimentacoes: Movimentacao[] = [
  {
    id: 2,
    produtoId: 1,
    produtoNome: 'Teclado',
    tipo: 'SAIDA',
    quantidade: 3,
    saldoApos: 7,
    dataHora: '2026-11-09T23:20:34.367339Z',
  },
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

describe('MovimentacaoLista', () => {
  let fixture: ComponentFixture<MovimentacaoLista>;
  let http: HttpTestingController;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MovimentacaoLista],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MovimentacaoLista);
    el = fixture.nativeElement;
  });

  afterEach(() => http.verify());

  async function carregarCom(lista: Movimentacao[]): Promise<void> {
    fixture.detectChanges();
    http.expectOne(URL).flush(lista);
    await fixture.whenStable();
  }

  function celulas(linha: number): HTMLTableCellElement[] {
    const tr = el.querySelectorAll('tbody tr')[linha];
    return Array.from(tr.querySelectorAll('td'));
  }

  it('lista o histórico na ordem recebida, com data, produto, quantidade e saldo', async () => {
    await carregarCom(movimentacoes);

    expect(el.querySelectorAll('tbody tr').length).toBe(2);

    const primeira = celulas(0);
    expect(primeira[0].textContent?.trim()).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/);
    expect(primeira[1].textContent?.trim()).toBe('Teclado');
    expect(primeira[3].textContent?.trim()).toBe('3');
    expect(primeira[4].textContent?.trim()).toBe('7');

    const segunda = celulas(1);
    expect(segunda[3].textContent?.trim()).toBe('10');
    expect(segunda[4].textContent?.trim()).toBe('10');
  });

  it('mostra o tipo em português e com a classe de cor certa', async () => {
    await carregarCom(movimentacoes);

    const saida = celulas(0)[2];
    expect(saida.textContent?.trim()).toBe('Saída');
    expect(saida.classList.contains('saida')).toBe(true);

    const entrada = celulas(1)[2];
    expect(entrada.textContent?.trim()).toBe('Entrada');
    expect(entrada.classList.contains('entrada')).toBe(true);
  });

  it('avisa quando não há movimentações', async () => {
    await carregarCom([]);

    expect(el.textContent).toContain('Nenhuma movimentação registrada.');
    expect(el.querySelector('table')).toBeNull();
  });

  it('mostra o erro quando a API falha', async () => {
    fixture.detectChanges();
    http.expectOne(URL).flush('falha', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(el.querySelector('.erro')?.textContent).toContain(
      'Não foi possível carregar o histórico',
    );
  });
});
