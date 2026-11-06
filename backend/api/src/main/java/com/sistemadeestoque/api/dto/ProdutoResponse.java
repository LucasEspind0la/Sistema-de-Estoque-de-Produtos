package com.sistemadeestoque.api.dto;

import com.sistemadeestoque.api.model.Produto;
import java.math.BigDecimal;

public record ProdutoResponse(Long id, String nome, BigDecimal preco, int quantidade) {
    public static ProdutoResponse de(Produto p) {
        return new ProdutoResponse(p.getId(), p.getNome(), p.getPreco(), p.getQuantidade());
    }
}
