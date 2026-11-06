package com.sistemadeestoque.api.dto;

import jakarta.validation.constraints.Positive;

public record MovimentacaoRequest(@Positive int quantidade) {}
