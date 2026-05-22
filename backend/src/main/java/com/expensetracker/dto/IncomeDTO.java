package com.expensetracker.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncomeDTO {
    
    private Long id;
    
    @NotBlank(message = "Source is required")
    private String source;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;
    
    private String description;
    
    @NotNull(message = "Date is required")
    private LocalDate date;
}
