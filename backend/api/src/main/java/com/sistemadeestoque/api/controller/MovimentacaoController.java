package com.sistemadeestoque.api.controller;

import com.sistemadeestoque.api.dto.MovimentacaoResponse;
import com.sistemadeestoque.api.service.EstoqueService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/movimentacoes")
public class MovimentacaoController {

    private final EstoqueService service;

    public MovimentacaoController(EstoqueService service) {
        this.service = service;
    }

    @GetMapping
    public List<MovimentacaoResponse> listar(@RequestParam(required = false) Long produtoId) {
        return service.listarMovimentacoes(produtoId);
    }
}
