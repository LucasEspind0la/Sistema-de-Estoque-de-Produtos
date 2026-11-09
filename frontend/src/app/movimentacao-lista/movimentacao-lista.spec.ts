import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovimentacaoLista } from './movimentacao-lista';

describe('MovimentacaoLista', () => {
  let component: MovimentacaoLista;
  let fixture: ComponentFixture<MovimentacaoLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovimentacaoLista]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovimentacaoLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
