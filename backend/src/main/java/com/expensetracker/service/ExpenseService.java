package com.expensetracker.service;

import com.expensetracker.dto.ExpenseDTO;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.Expense;
import com.expensetracker.model.User;
import com.expensetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserService userService;

    public List<Expense> getExpensesByUserId(Long userId) {
        return expenseRepository.findByUserIdOrderByDateDesc(userId);
    }

    public Expense getExpenseByIdAndUserId(Long id, Long userId) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        if (!expense.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to access this expense");
        }
        return expense;
    }

    @Transactional
    public Expense createExpense(ExpenseDTO expenseDTO, Long userId) {
        User user = userService.getUserById(userId);
        
        Expense expense = Expense.builder()
                .user(user)
                .amount(expenseDTO.getAmount())
                .category(expenseDTO.getCategory())
                .description(expenseDTO.getDescription())
                .paymentMethod(expenseDTO.getPaymentMethod())
                .date(expenseDTO.getDate())
                .build();
                
        return expenseRepository.save(expense);
    }

    @Transactional
    public Expense updateExpense(Long id, ExpenseDTO expenseDTO, Long userId) {
        Expense expense = getExpenseByIdAndUserId(id, userId);
        
        expense.setAmount(expenseDTO.getAmount());
        expense.setCategory(expenseDTO.getCategory());
        expense.setDescription(expenseDTO.getDescription());
        expense.setPaymentMethod(expenseDTO.getPaymentMethod());
        expense.setDate(expenseDTO.getDate());
        
        return expenseRepository.save(expense);
    }

    @Transactional
    public void deleteExpense(Long id, Long userId) {
        Expense expense = getExpenseByIdAndUserId(id, userId);
        expenseRepository.delete(expense);
    }
}
