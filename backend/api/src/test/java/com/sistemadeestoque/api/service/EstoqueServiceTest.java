package com.sistemadeestoque.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.sistemadeestoque.api.exception.EstoqueInsuficienteException;
import com.sistemadeestoque.api.exception.ProdutoNaoEncontradoException;
import com.sistemadeestoque.api.model.Produto;
import com.sistemadeestoque.api.repository.ProdutoRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EstoqueServiceTest {

    @Mock
    private ProdutoRepository repository;

    @InjectMocks
    private EstoqueService service;

    private Produto produtoExistente() {
        Produto produto = new Produto("Teclado", new BigDecimal("129.90"));
        when(repository.findById(1L)).thenReturn(Optional.of(produto));
        return produto;
    }

    @Test
    void cadastrarSalvaProdutoComQuantidadeZero() {
        when(repository.save(any(Produto.class))).thenAnswer(inv -> inv.getArgument(0));

        Produto salvo = service.cadastrar("Mouse", new BigDecimal("59.90"));

        assertThat(salvo.getNome()).isEqualTo("Mouse");
        assertThat(salvo.getQuantidade()).isZero();
        verify(repository).save(any(Produto.class));
    }

    @Test
    void buscarRetornaOProdutoQuandoExiste() {
        Produto produto = produtoExistente();

        Produto encontrado = service.buscar(1L);

        assertThat(encontrado).isSameAs(produto);
    }

    @Test
    void buscarLancaExcecaoQuandoNaoExiste() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ProdutoNaoEncontradoException.class, () -> service.buscar(999L));
    }

    @Test
    void listarRetornaTodosOsProdutos() {
        Produto produto = new Produto("Teclado", new BigDecimal("129.90"));
        when(repository.findAll()).thenReturn(List.of(produto));

        List<Produto> lista = service.listar();

        assertThat(lista).hasSize(1);
    }

    @Test
    void entradaAumentaOSaldo() {
        produtoExistente();

        Produto resultado = service.entrada(1L, 10);

        assertThat(resultado.getQuantidade()).isEqualTo(10);
    }

    @Test
    void entradaComQuantidadeInvalidaLancaExcecao() {
        Produto produto = produtoExistente();

        assertThrows(IllegalArgumentException.class, () -> service.entrada(1L, 0));
        assertThrows(IllegalArgumentException.class, () -> service.entrada(1L, -5));

        assertThat(produto.getQuantidade()).isZero();
    }

    @Test
    void entradaEmProdutoInexistenteLancaExcecao() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ProdutoNaoEncontradoException.class, () -> service.entrada(999L, 10));
    }

    @Test
    void saidaDiminuiOSaldo() {
        Produto produto = produtoExistente();
        produto.adicionar(10);

        Produto resultado = service.saida(1L, 3);

        assertThat(resultado.getQuantidade()).isEqualTo(7);
    }

    @Test
    void saidaMaiorQueOSaldoLancaExcecaoENaoAlteraOEstoque() {
        Produto produto = produtoExistente();
        produto.adicionar(5);

        assertThrows(EstoqueInsuficienteException.class, () -> service.saida(1L, 50));

        assertThat(produto.getQuantidade()).isEqualTo(5);
    }

    @Test
    void saidaEmProdutoInexistenteLancaExcecao() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ProdutoNaoEncontradoException.class, () -> service.saida(999L, 1));
    }
}