export interface Movimentacao {
  id: number;
  produtoId: number;
  produtoNome: string;
  tipo: 'ENTRADA' | 'SAIDA';
  quantidade: number;
  saldoApos: number;
  dataHora: string;
}
