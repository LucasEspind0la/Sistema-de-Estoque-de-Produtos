import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutoForm } from './produto-form';

const URL = 'http://localhost:8080/produtos';

describe('ProdutoForm', () => {
  let fixture: ComponentFixture<ProdutoForm>;
  let http: HttpTestingController;
  let el: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ProdutoForm],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProdutoForm);
    el = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  function preencher(nome: string, preco: string): void {
    const campoNome = el.querySelector<HTMLInputElement>('input[name="nome"]')!;
    const campoPreco = el.querySelector<HTMLInputElement>('input[name="preco"]')!;
    campoNome.value = nome;
    campoNome.dispatchEvent(new Event('input'));
    campoPreco.value = preco;
    campoPreco.dispatchEvent(new Event('input'));
  }

  function enviar(): void {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
  }

  it('mostra o formulário com os campos de nome e preço', () => {
    expect(el.querySelector('h2')?.textContent).toContain('Cadastrar produto');
    expect(el.querySelector('input[name="nome"]')).not.toBeNull();
    expect(el.querySelector('input[name="preco"]')).not.toBeNull();
    expect(el.querySelector('button[type="submit"]')?.textContent).toContain('Cadastrar');
  });

  it('pede o preço quando ele não foi informado, sem chamar a API', async () => {
    preencher('Mouse', '');
    enviar();
    await fixture.whenStable();

    expect(el.querySelector('.erro')?.textContent).toContain('Informe o preço.');
    http.expectNone(URL);
  });

  it('cadastra o produto, mostra o sucesso e avisa a página', async () => {
    let avisou = false;
    fixture.componentInstance.cadastrado.subscribe(() => (avisou = true));

    preencher('Mouse', '59.9');
    enviar();

    const req = http.expectOne(URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nome: 'Mouse', preco: 59.9 });
    req.flush({ id: 2, nome: 'Mouse', preco: 59.9, quantidade: 0 });
    await fixture.whenStable();

    expect(el.querySelector('.sucesso')?.textContent).toContain('Mouse');
    expect(el.querySelector('.sucesso')?.textContent).toContain('id 2');
    expect(el.querySelector('.erro')).toBeNull();
    expect(avisou).toBe(true);
  });

  it('mostra a mensagem da API quando o cadastro é recusado', async () => {
    let avisou = false;
    fixture.componentInstance.cadastrado.subscribe(() => (avisou = true));

    preencher('', '10');
    enviar();

    http
      .expectOne(URL)
      .flush(
        { erro: 'nome: não deve estar em branco' },
        { status: 400, statusText: 'Bad Request' },
      );
    await fixture.whenStable();

    expect(el.querySelector('.erro')?.textContent).toContain('nome: não deve estar em branco');
    expect(el.querySelector('.sucesso')).toBeNull();
    expect(avisou).toBe(false);
  });
});
