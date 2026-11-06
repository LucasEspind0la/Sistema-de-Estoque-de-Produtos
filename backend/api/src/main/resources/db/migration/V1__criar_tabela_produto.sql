CREATE TABLE produto (
    id         BIGSERIAL PRIMARY KEY,
    nome       VARCHAR(150)  NOT NULL,
    preco      NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
    quantidade INTEGER       NOT NULL DEFAULT 0 CHECK (quantidade >= 0)
);