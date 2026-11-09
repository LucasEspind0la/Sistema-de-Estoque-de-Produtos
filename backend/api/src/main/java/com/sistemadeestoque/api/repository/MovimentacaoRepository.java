package com.sistemadeestoque.api.repository;

import com.sistemadeestoque.api.model.Movimentacao;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovimentacaoRepository extends JpaRepository<Movimentacao, Long> {

    List<Movimentacao> findTop100ByOrderByDataHoraDescIdDesc();

    List<Movimentacao> findTop100ByProdutoIdOrderByDataHoraDescIdDesc(Long produtoId);
}
