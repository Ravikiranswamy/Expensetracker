package com.expensetracker.controller;

import com.expensetracker.dto.IncomeDTO;
import com.expensetracker.model.Income;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.IncomeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/income")
public class IncomeController {

    @Autowired
    private IncomeService incomeService;

    @GetMapping
    public ResponseEntity<List<IncomeDTO>> getAllIncome(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Income> incomes = incomeService.getIncomeByUserId(currentUser.getId());
        List<IncomeDTO> dtos = incomes.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncomeDTO> getIncomeById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Income income = incomeService.getIncomeByIdAndUserId(id, currentUser.getId());
        return ResponseEntity.ok(mapToDTO(income));
    }

    @PostMapping
    public ResponseEntity<IncomeDTO> createIncome(
            @Valid @RequestBody IncomeDTO incomeDTO,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Income income = incomeService.createIncome(incomeDTO, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToDTO(income));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncomeDTO> updateIncome(
            @PathVariable Long id,
            @Valid @RequestBody IncomeDTO incomeDTO,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Income income = incomeService.updateIncome(id, incomeDTO, currentUser.getId());
        return ResponseEntity.ok(mapToDTO(income));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        incomeService.deleteIncome(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    private IncomeDTO mapToDTO(Income income) {
        return IncomeDTO.builder()
                .id(income.getId())
                .source(income.getSource())
                .amount(income.getAmount())
                .description(income.getDescription())
                .date(income.getDate())
                .build();
    }
}
