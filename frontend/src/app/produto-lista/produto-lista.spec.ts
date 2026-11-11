import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Produto } from '../produto.model';
import { ProdutoLista } from './produto-lista';

const URL = 'http://localhost:8080/produtos';

const produtos: Produto[] = [
  { id: 1, nome: 'Teclado', preco: 129.9, quantidade: 0 },
  { id: 2, nome: 'Mouse', preco: 59.9, quantidade: 4 },
];

describe('ProdutoLista', () => {
  let fixture: ComponentFixture<ProdutoLista>;
  let http: HttpTestingController;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProdutoLista],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProdutoLista);
    el = fixture.nativeElement;
  });

  afterEach(() => http.verify());

  async function carregarCom(lista: Produto[]): Promise<void> {
    fixture.detectChanges();
    http.expectOne(URL).flush(lista);
    await fixture.whenStable();
  }

  function linhas(): HTMLTableRowElement[] {
    return Array.from(el.querySelectorAll<HTMLTableRowElement>('tbody tr'));
  }

  function celula(linha: number, coluna: number): string {
    return linhas()[linha].querySelectorAll('td')[coluna].textContent?.trim() ?? '';
  }

  function movimentar(linha: number, botao: string, quantidade: string): void {
    const tr = linhas()[linha];
    tr.querySelector<HTMLInputElement>('input')!.value = quantidade;
    Array.from(tr.querySelectorAll('button'))
      .find((b) => b.textContent?.trim() === botao)!
      .click();
  }

  it('mostra "Carregando..." enquanto espera a API', () => {
    fixture.detectChanges();

    expect(el.textContent).toContain('Carregando...');

    http.expectOne(URL).flush([]);
  });

  it('lista os produtos recebidos da API', async () => {
    await carregarCom(produtos);

    expect(linhas().length).toBe(2);
    expect(celula(0, 1)).toBe('Teclado');
    expect(celula(0, 3)).toBe('0');
    expect(celula(1, 1)).toBe('Mouse');
    expect(celula(1, 3)).toBe('4');
  });

  it('avisa quando não há produtos cadastrados', async () => {
    await carregarCom([]);

    expect(el.textContent).toContain('Nenhum produto cadastrado.');
    expect(el.querySelector('table')).toBeNull();
  });

  it('mostra o erro quando a API falha e permite tentar de novo', async () => {
    fixture.detectChanges();
    http.expectOne(URL).flush('falha', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(el.querySelector('.erro')?.textContent).toContain(
      'Não foi possível carregar os produtos',
    );

    el.querySelector<HTMLButtonElement>('button')!.click();
    http.expectOne(URL).flush(produtos);
    await fixture.whenStable();

    expect(linhas().length).toBe(2);
    expect(el.querySelector('.erro')).toBeNull();
  });

  it('registra uma entrada, atualiza o saldo na linha e avisa a página', async () => {
    let avisou = false;
    fixture.componentInstance.movimentado.subscribe(() => (avisou = true));
    await carregarCom(produtos);

    movimentar(0, 'Entrada', '10');

    const req = http.expectOne(`${URL}/1/entrada`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ quantidade: 10 });
    req.flush({ id: 1, nome: 'Teclado', preco: 129.9, quantidade: 10 });
    await fixture.whenStable();

    expect(celula(0, 3)).toBe('10');
    expect(celula(1, 3)).toBe('4');
    expect(el.querySelector('.sucesso')?.textContent).toContain('Saldo atual: 10');
    expect(avisou).toBe(true);
  });

  it('registra uma saída e atualiza o saldo só da linha certa', async () => {
    await carregarCom(produtos);

    movimentar(1, 'Saída', '3');

    const req = http.expectOne(`${URL}/2/saida`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ quantidade: 3 });
    req.flush({ id: 2, nome: 'Mouse', preco: 59.9, quantidade: 1 });
    await fixture.whenStable();

    expect(celula(0, 3)).toBe('0');
    expect(celula(1, 3)).toBe('1');
    expect(el.querySelector('.sucesso')?.textContent).toContain('Saldo atual: 1');
  });

  it('mostra a mensagem da API quando a saída é recusada, sem alterar o saldo', async () => {
    let avisou = false;
    fixture.componentInstance.movimentado.subscribe(() => (avisou = true));
    await carregarCom(produtos);

    movimentar(0, 'Saída', '50');

    http
      .expectOne(`${URL}/1/saida`)
      .flush(
        { erro: 'Saldo insuficiente: disponível 0, solicitado 50' },
        { status: 409, statusText: 'Conflict' },
      );
    await fixture.whenStable();

    expect(el.querySelector('.erro')?.textContent).toContain('Saldo insuficiente');
    expect(celula(0, 3)).toBe('0');
    expect(avisou).toBe(false);
  });

  it('pede a quantidade quando o campo está vazio, sem chamar a API', async () => {
    await carregarCom(produtos);

    movimentar(0, 'Entrada', '');
    await fixture.whenStable();

    expect(el.querySelector('.erro')?.textContent).toContain('Informe a quantidade.');
    http.expectNone(`${URL}/1/entrada`);
  });

  it('recusa quantidade decimal sem chamar a API', async () => {
    await carregarCom(produtos);

    movimentar(0, 'Saída', '1.5');
    await fixture.whenStable();

    expect(el.querySelector('.erro')?.textContent).toContain('número inteiro');
    http.expectNone(`${URL}/1/saida`);
  });
});
