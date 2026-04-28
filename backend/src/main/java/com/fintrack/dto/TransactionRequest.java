package com.fintrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {
    @NotBlank
    private String type;

    @NotBlank
    private String category;

    @NotNull
    @Positive
    private BigDecimal amount;

    private String description;

    @NotNull
    private LocalDate date;
}
