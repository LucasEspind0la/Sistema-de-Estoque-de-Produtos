# Sistema de Estoque de Produtos

Sistema para controle de estoque, com API REST em Java e interface web em Angular: cadastro de produtos, entradas e saídas, com regras que impedem saldo negativo e um histórico de todas as movimentações.

Projeto de estudos para praticar Java, Spring Boot, banco de dados relacional, Angular e testes automatizados.

## O que o sistema faz

- Cadastra produtos (nome e preço). Todo produto nasce com quantidade 0.
- Lista todos os produtos e busca um produto pelo id.
- Registra **entradas** (aumentam o saldo) e **saídas** (diminuem o saldo).
- Guarda um **histórico de movimentações**: cada entrada e saída registra o produto, o tipo, a quantidade, o saldo depois da operação e a data e hora.

## Regras de negócio

- Cada produto tem um **id único**, gerado pelo banco de dados.
- A quantidade de uma entrada ou saída precisa ser **maior que 0** (valores zero ou negativos são recusados).
- Não é possível retirar **mais do que existe** em estoque.
- O nome do produto é obrigatório e o preço não pode ser negativo.
- O saldo e o histórico são gravados na **mesma transação**: se uma das gravações falhar, a outra também é desfeita.
- Operações recusadas (saldo insuficiente, quantidade inválida) **não geram histórico**.

## Tecnologias

**Backend**
- Java 21
- Spring Boot (Web, Data JPA, Validation)
- PostgreSQL 16
- Flyway (versionamento do banco de dados)
- Maven
- JUnit 5, Mockito e Testcontainers (testes)

**Frontend**
- Angular 21 e TypeScript
- Componentes standalone, signals e HttpClient
- Vitest (testes)

**Infraestrutura**
- Docker Compose (para subir o banco de dados)

## Endpoints

| Método | Rota                       | O que faz                                      | Sucesso       |
|--------|----------------------------|------------------------------------------------|---------------|
| POST   | `/produtos`                | Cadastra um produto                            | `201 Created` |
| GET    | `/produtos`                | Lista todos os produtos                        | `200 OK`      |
| GET    | `/produtos/{id}`           | Busca um produto pelo id                       | `200 OK`      |
| POST   | `/produtos/{id}/entrada`   | Registra uma entrada                           | `200 OK`      |
| POST   | `/produtos/{id}/saida`     | Registra uma saída                             | `200 OK`      |
| GET    | `/movimentacoes`           | Lista as 100 movimentações mais recentes       | `200 OK`      |
| GET    | `/movimentacoes?produtoId={id}` | Lista as movimentações de um produto      | `200 OK`      |

### Erros

Os erros voltam em JSON, no formato `{"erro": "mensagem"}`.

| Situação                                                                    | Status            |
|-----------------------------------------------------------------------------|-------------------|
| Dados inválidos (nome vazio, preço negativo, quantidade menor ou igual a 0) | `400 Bad Request` |
| Produto não encontrado (inclui `?produtoId=` de um produto inexistente)     | `404 Not Found`   |
| Saída maior que o saldo disponível                                          | `409 Conflict`    |

### Exemplos

Cadastrar um produto:

```bash
curl -X POST localhost:8080/produtos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teclado","preco":129.90}'
```

Resposta:

```json
{"id":1,"nome":"Teclado","preco":129.90,"quantidade":0}
```

Registrar uma entrada de 10 unidades:

```bash
curl -X POST localhost:8080/produtos/1/entrada \
  -H "Content-Type: application/json" \
  -d '{"quantidade":10}'
```

Registrar uma saída de 3 unidades:

```bash
curl -X POST localhost:8080/produtos/1/saida \
  -H "Content-Type: application/json" \
  -d '{"quantidade":3}'
```

Consultar o histórico de um produto:

```bash
curl "localhost:8080/movimentacoes?produtoId=1"
```

Resposta (a movimentação mais recente vem primeiro):

```json
[
  {"id":2,"produtoId":1,"produtoNome":"Teclado","tipo":"SAIDA","quantidade":3,"saldoApos":7,"dataHora":"2026-11-09T23:20:34.367339Z"},
  {"id":1,"produtoId":1,"produtoNome":"Teclado","tipo":"ENTRADA","quantidade":10,"saldoApos":10,"dataHora":"2026-11-09T23:20:34.251664Z"}
]
```

## Interface web

A interface em Angular tem uma única página com três partes:

- **Cadastrar produto:** formulário com nome e preço. Mostra as mensagens de erro da API.
- **Produtos:** tabela com id, nome, preço e quantidade. Cada linha tem um campo de quantidade e os botões **Entrada** e **Saída**.
- **Histórico de movimentações:** tabela com data e hora, produto, tipo, quantidade e saldo após a operação. Atualiza sozinha a cada entrada ou saída.

As regras de negócio ficam todas no backend. A interface apenas exibe as mensagens que a API devolve.

## Como rodar

### Pré-requisitos

- Java 21
- Docker e Docker Compose
- Node.js 20.19 ou superior (com npm)
- Git

### Passo a passo

1. Clone o repositório:

```bash
git clone https://github.com/LucasEspind0la/Sistema-de-Estoque-de-Produtos.git
cd Sistema-de-Estoque-de-Produtos
```

2. Entre na pasta da API e crie o arquivo `.env` a partir do exemplo:

```bash
cd backend/api
cp .env.example .env
```

Abra o `.env` e defina a senha do banco:

```
POSTGRES_DB=estoque
POSTGRES_USER=estoque
POSTGRES_PASSWORD=defina-sua-senha-aqui
```

O arquivo `.env` não é enviado ao GitHub, por isso cada pessoa cria o seu.

3. Suba o banco de dados:

```bash
docker compose up -d
```

O banco fica disponível na porta `5433` do seu computador. As tabelas são criadas automaticamente pelo Flyway na primeira execução.

4. Rode a API:

```bash
./mvnw spring-boot:run
```

A API fica disponível em `http://localhost:8080`.

5. Em **outro terminal**, rode a interface web:

```bash
cd frontend
npm install
npm start
```

Abra `http://localhost:4200` no navegador.

## Testes

### Backend

O backend tem dois tipos de teste:

- **Testes unitários** (`ProdutoTest` e `EstoqueServiceTest`): cobrem as regras de negócio e o registro do histórico, com o banco simulado.
- **Testes de integração** (`EstoqueIntegrationTest`): sobem a aplicação inteira com um PostgreSQL de verdade, em um container temporário (Testcontainers), e chamam os endpoints. Verificam também as migrações do Flyway.

```bash
cd backend/api
./mvnw test
```

São 33 testes. Os de integração precisam do Docker em execução, mas não usam o banco de desenvolvimento nem o arquivo `.env`.

### Frontend

Os testes do frontend usam Vitest e o `HttpTestingController` do Angular, que simula a API. Por isso não precisam do backend nem do banco de dados. Cobrem o serviço de acesso à API, o formulário de cadastro, a lista de produtos (entrada e saída), o histórico e a página completa, incluindo a atualização entre os componentes.

```bash
cd frontend
npm install
npm test -- --watch=false
```

São 25 testes.

## Estrutura do projeto

```
.
├── backend/api/
│   ├── compose.yaml            banco PostgreSQL (Docker)
│   ├── .env.example            modelo das variáveis do banco
│   └── src/
│       ├── main/java/com/sistemadeestoque/api/
│       │   ├── controller/     ProdutoController, MovimentacaoController
│       │   ├── service/        EstoqueService (regras de negócio)
│       │   ├── repository/     acesso ao banco de dados
│       │   ├── model/          Produto, Movimentacao, TipoMovimentacao
│       │   ├── dto/            objetos de entrada e saída da API
│       │   ├── exception/      exceções e tratamento de erros
│       │   └── config/         CORS (libera o front em localhost:4200)
│       ├── main/resources/
│       │   ├── application.yaml
│       │   └── db/migration/   V1 (produto) e V2 (movimentacao)
│       └── test/               testes unitários e de integração
└── frontend/
    └── src/app/
        ├── produto-form/       formulário de cadastro
        ├── produto-lista/      tabela de produtos, entrada e saída
        ├── movimentacao-lista/ histórico de movimentações
        ├── produto-api.ts      chamadas à API
        └── *.model.ts          tipos Produto e Movimentacao
```

## Banco de dados

Tabela `produto`:

| Coluna     | Tipo          | Observação                  |
|------------|---------------|-----------------------------|
| id         | BIGSERIAL     | chave primária              |
| nome       | VARCHAR(150)  | obrigatório                 |
| preco      | NUMERIC(10,2) | não pode ser negativo       |
| quantidade | INTEGER       | começa em 0, nunca negativa |

Tabela `movimentacao`:

| Coluna     | Tipo                     | Observação                          |
|------------|--------------------------|-------------------------------------|
| id         | BIGSERIAL                | chave primária                      |
| produto_id | BIGINT                   | chave estrangeira para `produto`    |
| tipo       | VARCHAR(10)              | `ENTRADA` ou `SAIDA`                |
| quantidade | INTEGER                  | maior que 0                         |
| saldo_apos | INTEGER                  | saldo do produto depois da operação |
| data_hora  | TIMESTAMP WITH TIME ZONE | momento do registro                 |

