package com.expensetracker.service;

import com.expensetracker.dto.DashboardDTO;
import com.expensetracker.model.Expense;
import com.expensetracker.model.Income;
import com.expensetracker.model.User;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.repository.IncomeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private UserService userService;

    public DashboardDTO getDashboardSummary(Long userId) {
        User user = userService.getUserById(userId);

        // Calculate total income and expenses
        BigDecimal totalIncome = incomeRepository.sumTotalByUserId(userId);
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;

        BigDecimal totalExpenses = expenseRepository.sumTotalByUserId(userId);
        if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;

        BigDecimal remainingBalance = totalIncome.subtract(totalExpenses);

        // Current Month Dates
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        // Calculate this month's expenses
        BigDecimal monthlyExpenses = expenseRepository.sumTotalByUserIdAndDateBetween(userId, startOfMonth, endOfMonth);
        if (monthlyExpenses == null) monthlyExpenses = BigDecimal.ZERO;

        BigDecimal monthlyBudget = user.getMonthlyBudget();
        if (monthlyBudget == null) monthlyBudget = BigDecimal.ZERO;

        BigDecimal remainingBudget = monthlyBudget.subtract(monthlyExpenses);
        boolean isOverBudget = monthlyBudget.compareTo(BigDecimal.ZERO) > 0 && monthlyExpenses.compareTo(monthlyBudget) > 0;

        // Fetch recent transactions (merge last 10 expenses & last 10 incomes, then sort and take top 5)
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, startOfMonth, endOfMonth);
        // Fallback to general list if current month is empty to show recent transactions
        if (expenses.isEmpty()) {
            expenses = expenseRepository.findByUserIdOrderByDateDesc(userId);
            if (expenses.size() > 10) expenses = expenses.subList(0, 10);
        }

        List<Income> incomes = incomeRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, startOfMonth, endOfMonth);
        if (incomes.isEmpty()) {
            incomes = incomeRepository.findByUserIdOrderByDateDesc(userId);
            if (incomes.size() > 10) incomes = incomes.subList(0, 10);
        }

        List<DashboardDTO.RecentTransaction> recentTxList = new ArrayList<>();
        
        for (Expense e : expenses) {
            recentTxList.add(DashboardDTO.RecentTransaction.builder()
                    .id(e.getId())
                    .type("EXPENSE")
                    .amount(e.getAmount())
                    .categoryOrSource(e.getCategory())
                    .description(e.getDescription())
                    .date(e.getDate())
                    .build());
        }

        for (Income i : incomes) {
            recentTxList.add(DashboardDTO.RecentTransaction.builder()
                    .id(i.getId())
                    .type("INCOME")
                    .amount(i.getAmount())
                    .categoryOrSource(i.getSource())
                    .description(i.getDescription())
                    .date(i.getDate())
                    .build());
        }

        // Sort recent transactions by date descending and limit to top 5
        List<DashboardDTO.RecentTransaction> sortedRecentTx = recentTxList.stream()
                .sorted(Comparator.comparing(DashboardDTO.RecentTransaction::getDate).reversed()
                        .thenComparing(Comparator.comparing(DashboardDTO.RecentTransaction::getId).reversed()))
                .limit(5)
                .collect(Collectors.toList());

        return DashboardDTO.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .remainingBalance(remainingBalance)
                .monthlyBudget(monthlyBudget)
                .monthlyExpenses(monthlyExpenses)
                .remainingBudget(remainingBudget)
                .isOverBudget(isOverBudget)
                .recentTransactions(sortedRecentTx)
                .build();
    }
}
