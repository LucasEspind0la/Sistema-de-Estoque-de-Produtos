package com.sistemadeestoque.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.sistemadeestoque.api.model.Produto;
import com.sistemadeestoque.api.repository.MovimentacaoRepository;
import com.sistemadeestoque.api.repository.ProdutoRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class EstoqueIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:16");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private MovimentacaoRepository movimentacaoRepository;

    @BeforeEach
    void limparBanco() {
        movimentacaoRepository.deleteAll();
        produtoRepository.deleteAll();
    }

    private Produto criarProduto(String nome) {
        return produtoRepository.save(new Produto(nome, new BigDecimal("129.90")));
    }

    private ResultActions movimentar(long produtoId, String tipo, int quantidade)
            throws Exception {
        return mockMvc.perform(post("/produtos/" + produtoId + "/" + tipo)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"quantidade\":" + quantidade + "}"));
    }

    @Test
    void cadastrarProdutoRetorna201ComQuantidadeZero() throws Exception {
        mockMvc.perform(post("/produtos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Teclado\",\"preco\":129.90}"))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nome").value("Teclado"))
                .andExpect(jsonPath("$.quantidade").value(0));

        assertThat(produtoRepository.count()).isEqualTo(1);
    }

    @Test
    void entradaESaidaAtualizamOSaldoERegistramOHistorico() throws Exception {
        Produto produto = criarProduto("Teclado");

        movimentar(produto.getId(), "entrada", 10)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantidade").value(10));
        movimentar(produto.getId(), "saida", 3)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantidade").value(7));

        mockMvc.perform(get("/movimentacoes?produtoId=" + produto.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].tipo").value("SAIDA"))
                .andExpect(jsonPath("$[0].quantidade").value(3))
                .andExpect(jsonPath("$[0].saldoApos").value(7))
                .andExpect(jsonPath("$[1].tipo").value("ENTRADA"))
                .andExpect(jsonPath("$[1].quantidade").value(10))
                .andExpect(jsonPath("$[1].saldoApos").value(10));
    }

    @Test
    void saidaMaiorQueOSaldoRetorna409SemAlterarSaldoNemHistorico() throws Exception {
        Produto produto = criarProduto("Teclado");
        movimentar(produto.getId(), "entrada", 5).andExpect(status().isOk());

        movimentar(produto.getId(), "saida", 50)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.erro")
                        .value("Saldo insuficiente: disponível 5, solicitado 50"));

        mockMvc.perform(get("/produtos/" + produto.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantidade").value(5));
        assertThat(movimentacaoRepository.count()).isEqualTo(1);
    }

    @Test
    void quantidadeZeroOuNegativaRetorna400SemAlterarNada() throws Exception {
        Produto produto = criarProduto("Teclado");

        for (int quantidade : new int[] {0, -5}) {
            movimentar(produto.getId(), "entrada", quantidade)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.erro").exists());
            movimentar(produto.getId(), "saida", quantidade)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.erro").exists());
        }

        mockMvc.perform(get("/produtos/" + produto.getId()))
                .andExpect(jsonPath("$.quantidade").value(0));
        assertThat(movimentacaoRepository.count()).isZero();
    }

    @Test
    void cadastroComDadosInvalidosRetorna400() throws Exception {
        String[] corpos = {
            "{\"nome\":\"\",\"preco\":10}",
            "{\"nome\":\"X\",\"preco\":-1}",
            "{\"nome\":\"X\"}"
        };

        for (String corpo : corpos) {
            mockMvc.perform(post("/produtos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(corpo))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.erro").exists());
        }

        assertThat(produtoRepository.count()).isZero();
    }

    @Test
    void produtoInexistenteRetorna404() throws Exception {
        mockMvc.perform(get("/produtos/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro").value("Produto não encontrado: 999999"));

        mockMvc.perform(get("/movimentacoes?produtoId=999999"))
                .andExpect(status().isNotFound());

        movimentar(999999, "entrada", 1).andExpect(status().isNotFound());
        movimentar(999999, "saida", 1).andExpect(status().isNotFound());
    }

    @Test
    void historicoPodeSerFiltradoPorProdutoEVemDoMaisRecenteParaOMaisAntigo()
            throws Exception {
        Produto teclado = criarProduto("Teclado");
        Produto mouse = criarProduto("Mouse");
        movimentar(teclado.getId(), "entrada", 10).andExpect(status().isOk());
        movimentar(mouse.getId(), "entrada", 4).andExpect(status().isOk());

        mockMvc.perform(get("/movimentacoes?produtoId=" + teclado.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].produtoNome").value("Teclado"));

        mockMvc.perform(get("/movimentacoes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].produtoNome").value("Mouse"))
                .andExpect(jsonPath("$[1].produtoNome").value("Teclado"));
    }

    @Test
    void respostaDoProdutoTrazOValorEmEstoque() throws Exception {
        Produto produto = criarProduto("Teclado");

        mockMvc.perform(get("/produtos/" + produto.getId()))
                .andExpect(jsonPath("$.valorEmEstoque").value(0.0));

        movimentar(produto.getId(), "entrada", 3)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valorEmEstoque").value(389.7));

        mockMvc.perform(get("/produtos"))
                .andExpect(jsonPath("$[0].valorEmEstoque").value(389.7));
    }
}
