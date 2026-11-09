CREATE TABLE movimentacao (
    id          BIGSERIAL PRIMARY KEY,
    produto_id  BIGINT      NOT NULL REFERENCES produto (id),
    tipo        VARCHAR(10) NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
    quantidade  INTEGER     NOT NULL CHECK (quantidade > 0),
    saldo_apos  INTEGER     NOT NULL CHECK (saldo_apos >= 0),
    data_hora   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_movimentacao_produto ON movimentacao (produto_id);
