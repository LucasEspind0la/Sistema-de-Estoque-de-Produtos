package com.sistemadeestoque.api.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.sistemadeestoque.api.exception.EstoqueInsuficienteException;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class ProdutoTest {

    private Produto produto;

    @BeforeEach
    void criarProduto() {
        produto = new Produto("Teclado", new BigDecimal("129.90"));
    }

    @Test
    void produtoNovoComecaComQuantidadeZero() {
        assertThat(produto.getQuantidade()).isZero();
    }

    @Test
    void adicionarAumentaAQuantidade() {
        produto.adicionar(10);

        assertThat(produto.getQuantidade()).isEqualTo(10);
    }

    @ParameterizedTest
    @ValueSource(ints = {0, -1, -50})
    void adicionarComQuantidadeInvalidaLancaExcecao(int quantidade) {
        assertThrows(IllegalArgumentException.class, () -> produto.adicionar(quantidade));

        assertThat(produto.getQuantidade()).isZero();
    }

    @Test
    void removerDiminuiAQuantidade() {
        produto.adicionar(10);

        produto.remover(3);

        assertThat(produto.getQuantidade()).isEqualTo(7);
    }

    @Test
    void removerExatamenteOSaldoZeraOEstoque() {
        produto.adicionar(5);

        produto.remover(5);

        assertThat(produto.getQuantidade()).isZero();
    }

    @ParameterizedTest
    @ValueSource(ints = {0, -1, -50})
    void removerComQuantidadeInvalidaLancaExcecao(int quantidade) {
        produto.adicionar(10);

        assertThrows(IllegalArgumentException.class, () -> produto.remover(quantidade));

        assertThat(produto.getQuantidade()).isEqualTo(10);
    }

    @Test
    void removerMaisDoQueExisteLancaExcecaoENaoAlteraOSaldo() {
        produto.adicionar(5);

        assertThrows(EstoqueInsuficienteException.class, () -> produto.remover(6));

        assertThat(produto.getQuantidade()).isEqualTo(5);
    }

    @Test
    void valorEmEstoqueEhZeroQuandoNaoHaQuantidade() {
        assertThat(produto.getValorEmEstoque()).isEqualByComparingTo("0");
    }

    @Test
    void valorEmEstoqueEhPrecoVezesQuantidade() {
        produto.adicionar(3);

        assertThat(produto.getValorEmEstoque()).isEqualByComparingTo("389.70");
    }

    @Test
    void valorEmEstoqueAcompanhaAsSaidas() {
        produto.adicionar(10);
        produto.remover(7);

        assertThat(produto.getValorEmEstoque()).isEqualByComparingTo("389.70");
    }
}
