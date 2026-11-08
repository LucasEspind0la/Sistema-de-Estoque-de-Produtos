import { TestBed } from '@angular/core/testing';

import { ProdutoApi } from './produto-api';

describe('ProdutoApi', () => {
  let service: ProdutoApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProdutoApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
