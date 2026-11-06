package com.sistemadeestoque.api.model;

import com.sistemadeestoque.api.exception.EstoqueInsuficienteException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "produto")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private BigDecimal preco;

    @Column(nullable = false)
    private int quantidade;

    protected Produto() {} // exigido pelo JPA

    public Produto(String nome, BigDecimal preco) {
        this.nome = nome;
        this.preco = preco;
        this.quantidade = 0; // sempre começa em 0
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public BigDecimal getPreco() { return preco; }
    public int getQuantidade() { return quantidade; }

    public void adicionar(int qtd) {
        validar(qtd);
        this.quantidade += qtd;
    }

    public void remover(int qtd) {
        validar(qtd);
        if (qtd > quantidade) {
            throw new EstoqueInsuficienteException(
                "Saldo insuficiente: disponível " + quantidade + ", solicitado " + qtd);
        }
        this.quantidade -= qtd;
    }

    private void validar(int qtd) {
        if (qtd <= 0) {
            throw new IllegalArgumentException("Quantidade deve ser maior que 0.");
        }
    }
}