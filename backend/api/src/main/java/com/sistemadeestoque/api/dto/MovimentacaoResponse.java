package com.sistemadeestoque.api.dto;

import com.sistemadeestoque.api.model.Movimentacao;
import java.time.Instant;

public record MovimentacaoResponse(
        Long id,
        Long produtoId,
        String produtoNome,
        String tipo,
        int quantidade,
        int saldoApos,
        Instant dataHora) {

    public static MovimentacaoResponse de(Movimentacao m) {
        return new MovimentacaoResponse(
                m.getId(),
                m.getProduto().getId(),
                m.getProduto().getNome(),
                m.getTipo().name(),
                m.getQuantidade(),
                m.getSaldoApos(),
                m.getDataHora());
    }
}
