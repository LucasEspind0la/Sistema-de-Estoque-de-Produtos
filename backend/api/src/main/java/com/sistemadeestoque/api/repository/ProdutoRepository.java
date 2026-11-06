package com.sistemadeestoque.api.repository;

import com.sistemadeestoque.api.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {}
