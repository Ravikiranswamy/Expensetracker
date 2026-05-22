package com.expensetracker.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal remainingBalance;
    private BigDecimal monthlyBudget;
    private BigDecimal monthlyExpenses;
    private BigDecimal remainingBudget;
    private boolean isOverBudget;
    private List<RecentTransaction> recentTransactions;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentTransaction {
        private Long id;
        private String type; // "INCOME" or "EXPENSE"
        private BigDecimal amount;
        private String categoryOrSource;
        private String description;
        private LocalDate date;
    }
}
