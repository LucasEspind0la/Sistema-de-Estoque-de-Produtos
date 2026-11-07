# Sistema de Estoque de Produtos

API REST para controle de estoque: cadastro de produtos e registro de entradas e saídas, com regras que impedem saldo negativo.

Projeto de estudos para praticar Java, Spring Boot, banco de dados relacional e testes automatizados.

## O que o sistema faz

- Cadastra produtos (nome e preço). Todo produto nasce com quantidade 0.
- Busca um produto pelo id e lista todos os produtos.
- Registra **entradas** (aumentam o saldo) e **saídas** (diminuem o saldo).

## Regras de negócio

- Cada produto tem um **id único**, gerado pelo banco de dados.
- A quantidade de uma entrada ou saída precisa ser **maior que 0** (valores zero ou negativos são recusados).
- Não é possível retirar **mais do que existe** em estoque.
- O nome do produto é obrigatório e o preço não pode ser negativo.

## Tecnologias

- Java 21
- Spring Boot (Web, Data JPA, Validation)
- PostgreSQL 16
- Flyway (versionamento do banco de dados)
- Docker Compose (para subir o banco)
- Maven
- JUnit 5 e Mockito (testes)

## Endpoints

| Método | Rota                     | O que faz                  | Resposta de sucesso |
|--------|--------------------------|----------------------------|---------------------|
| POST   | `/produtos`              | Cadastra um produto        | `201 Created`       |
| GET    | `/produtos`              | Lista todos os produtos    | `200 OK`            |
| GET    | `/produtos/{id}`         | Busca um produto pelo id   | `200 OK`            |
| POST   | `/produtos/{id}/entrada` | Registra uma entrada       | `200 OK`            |
| POST   | `/produtos/{id}/saida`   | Registra uma saída         | `200 OK`            |

### Erros

Os erros voltam em JSON, no formato `{"erro": "mensagem"}`.

| Situação                                      | Status |
|-----------------------------------------------|--------|
| Dados inválidos (nome vazio, preço negativo, quantidade menor ou igual a 0) | `400 Bad Request` |
| Produto não encontrado                        | `404 Not Found` |
| Saída maior que o saldo disponível            | `409 Conflict` |


## Como rodar

### Pré-requisitos

- Java 21
- Docker e Docker Compose
- Git

### Passo a passo

1. Clone o repositório e entre na pasta da API:

```bash
git clone https://github.com/LucasEspind0la/Sistema-de-Estoque-de-Produtos.git
cd Sistema-de-Estoque-de-Produtos/backend/api
```

2. Crie o arquivo `.env` a partir do exemplo e defina uma senha para o banco:

```bash
cp .env.example .env
```

Abra o `.env` e preencha:

```
POSTGRES_DB=estoque
POSTGRES_USER=estoque
POSTGRES_PASSWORD=defina-sua-senha-aqui
```

3. Suba o banco de dados:

```bash
docker compose up -d
```

O banco fica disponível na porta `5433` do seu computador. A tabela `produto` é criada automaticamente pelo Flyway na primeira execução.

4. Rode a aplicação:

```bash
./mvnw spring-boot:run
```

A API fica disponível em `http://localhost:8080`.

## Testes

Os testes unitários cobrem as regras do `Produto` e do `EstoqueService`:

```bash
./mvnw test -Dtest='ProdutoTest,EstoqueServiceTest'
```

## Estrutura do projeto

```
backend/api/src/main/java/com/sistemadeestoque/api/
├── controller/    recebe as requisições HTTP
├── service/       regras de negócio (EstoqueService)
├── repository/    acesso ao banco de dados
├── model/         entidade Produto
├── dto/           objetos de entrada e saída da API
└── exception/     exceções e tratamento de erros

backend/api/src/main/resources/
├── application.yaml
└── db/migration/  scripts do Flyway (criação das tabelas)
```

## Banco de dados

Tabela `produto`:

| Coluna     | Tipo          | Observação                   |
|------------|---------------|------------------------------|
| id         | BIGSERIAL     | chave primária               |
| nome       | VARCHAR(150)  | obrigatório                  |
| preco      | NUMERIC(10,2) | não pode ser negativo        |
| quantidade | INTEGER       | começa em 0, nunca negativa  |

## Próximos passos

- Interface web com Angular
- Histórico de movimentações (entradas e saídas)
- Testes de integração com banco de dados

