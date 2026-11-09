package com.sistemadeestoque.api.service;

import com.sistemadeestoque.api.dto.MovimentacaoResponse;
import com.sistemadeestoque.api.exception.ProdutoNaoEncontradoException;
import com.sistemadeestoque.api.model.Movimentacao;
import com.sistemadeestoque.api.model.Produto;
import com.sistemadeestoque.api.model.TipoMovimentacao;
import com.sistemadeestoque.api.repository.MovimentacaoRepository;
import com.sistemadeestoque.api.repository.ProdutoRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EstoqueService {

    private final ProdutoRepository produtoRepository;
    private final MovimentacaoRepository movimentacaoRepository;

    public EstoqueService(
            ProdutoRepository produtoRepository,
            MovimentacaoRepository movimentacaoRepository) {
        this.produtoRepository = produtoRepository;
        this.movimentacaoRepository = movimentacaoRepository;
    }

    @Transactional
    public Produto cadastrar(String nome, BigDecimal preco) {
        return produtoRepository.save(new Produto(nome, preco));
    }

    @Transactional(readOnly = true)
    public Produto buscar(Long id) {
        return obter(id);
    }

    @Transactional(readOnly = true)
    public List<Produto> listar() {
        return produtoRepository.findAll();
    }

    @Transactional
    public Produto entrada(Long id, int quantidade) {
        Produto produto = obter(id);
        produto.adicionar(quantidade);
        registrar(produto, TipoMovimentacao.ENTRADA, quantidade);
        return produto;
    }

    @Transactional
    public Produto saida(Long id, int quantidade) {
        Produto produto = obter(id);
        produto.remover(quantidade);
        registrar(produto, TipoMovimentacao.SAIDA, quantidade);
        return produto;
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoResponse> listarMovimentacoes(Long produtoId) {
        List<Movimentacao> movimentacoes;

        if (produtoId == null) {
            movimentacoes = movimentacaoRepository.findTop100ByOrderByDataHoraDescIdDesc();
        } else {
            if (!produtoRepository.existsById(produtoId)) {
                throw new ProdutoNaoEncontradoException(produtoId);
            }
            movimentacoes =
                    movimentacaoRepository.findTop100ByProdutoIdOrderByDataHoraDescIdDesc(produtoId);
        }

        return movimentacoes.stream().map(MovimentacaoResponse::de).toList();
    }

    private void registrar(Produto produto, TipoMovimentacao tipo, int quantidade) {
        movimentacaoRepository.save(
                new Movimentacao(produto, tipo, quantidade, produto.getQuantidade()));
    }

    private Produto obter(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ProdutoNaoEncontradoException(id));
    }
}
