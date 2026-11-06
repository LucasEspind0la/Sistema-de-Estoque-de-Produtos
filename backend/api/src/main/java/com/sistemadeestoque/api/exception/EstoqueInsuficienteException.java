package com.sistemadeestoque.api.exception;

public class EstoqueInsuficienteException extends RuntimeException {
    public EstoqueInsuficienteException(String mensagem) { super(mensagem); }
}