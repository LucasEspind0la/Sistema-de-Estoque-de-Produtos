package com.sistemadeestoque.api.controller;

import com.sistemadeestoque.api.dto.MovimentacaoRequest;
import com.sistemadeestoque.api.dto.ProdutoRequest;
import com.sistemadeestoque.api.dto.ProdutoResponse;
import com.sistemadeestoque.api.model.Produto;
import com.sistemadeestoque.api.service.EstoqueService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    private final EstoqueService service;

    public ProdutoController(EstoqueService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ProdutoResponse> cadastrar(@Valid @RequestBody ProdutoRequest req) {
        Produto produto = service.cadastrar(req.nome(), req.preco());
        URI location = URI.create("/produtos/" + produto.getId());
        return ResponseEntity.created(location).body(ProdutoResponse.de(produto));
    }

    @GetMapping
    public List<ProdutoResponse> listar() {
        return service.listar().stream().map(ProdutoResponse::de).toList();
    }

    @GetMapping("/{id}")
    public ProdutoResponse buscar(@PathVariable Long id) {
        return ProdutoResponse.de(service.buscar(id));
    }

    @PostMapping("/{id}/entrada")
    public ProdutoResponse entrada(@PathVariable Long id,
                                   @Valid @RequestBody MovimentacaoRequest req) {
        return ProdutoResponse.de(service.entrada(id, req.quantidade()));
    }

    @PostMapping("/{id}/saida")
    public ProdutoResponse saida(@PathVariable Long id,
                                 @Valid @RequestBody MovimentacaoRequest req) {
        return ProdutoResponse.de(service.saida(id, req.quantidade()));
    }
}
