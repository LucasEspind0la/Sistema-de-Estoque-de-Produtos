package com.sistemadeestoque.api.service;

import com.sistemadeestoque.api.exception.ProdutoNaoEncontradoException;
import com.sistemadeestoque.api.model.Produto;
import com.sistemadeestoque.api.repository.ProdutoRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EstoqueService {

    private final ProdutoRepository repository;

    public EstoqueService(ProdutoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Produto cadastrar(String nome, BigDecimal preco) {
        return repository.save(new Produto(nome, preco));
    }

    @Transactional(readOnly = true)
    public Produto buscar(Long id) {
        return obter(id);
    }

    @Transactional(readOnly = true)
    public List<Produto> listar() {
        return repository.findAll();
    }

    @Transactional
    public Produto entrada(Long id, int quantidade) {
        Produto produto = obter(id);
        produto.adicionar(quantidade);
        return produto;
    }

    @Transactional
    public Produto saida(Long id, int quantidade) {
        Produto produto = obter(id);
        produto.remover(quantidade);
        return produto;
    }

    private Produto obter(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ProdutoNaoEncontradoException(id));
    }
}