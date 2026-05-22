package com.expensetracker.controller;

import com.expensetracker.dto.ExpenseDTO;
import com.expensetracker.model.Expense;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseDTO>> getAllExpenses(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Expense> expenses = expenseService.getExpensesByUserId(currentUser.getId());
        List<ExpenseDTO> dtos = expenses.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseDTO> getExpenseById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Expense expense = expenseService.getExpenseByIdAndUserId(id, currentUser.getId());
        return ResponseEntity.ok(mapToDTO(expense));
    }

    @PostMapping
    public ResponseEntity<ExpenseDTO> createExpense(
            @Valid @RequestBody ExpenseDTO expenseDTO,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Expense expense = expenseService.createExpense(expenseDTO, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToDTO(expense));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDTO> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseDTO expenseDTO,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Expense expense = expenseService.updateExpense(id, expenseDTO, currentUser.getId());
        return ResponseEntity.ok(mapToDTO(expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        expenseService.deleteExpense(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    private ExpenseDTO mapToDTO(Expense expense) {
        return ExpenseDTO.builder()
                .id(expense.getId())
                .amount(expense.getAmount())
                .category(expense.getCategory())
                .description(expense.getDescription())
                .paymentMethod(expense.getPaymentMethod())
                .date(expense.getDate())
                .build();
    }
}
