package com.expensetracker.service;

import com.expensetracker.dto.IncomeDTO;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.Income;
import com.expensetracker.model.User;
import com.expensetracker.repository.IncomeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class IncomeService {

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private UserService userService;

    public List<Income> getIncomeByUserId(Long userId) {
        return incomeRepository.findByUserIdOrderByDateDesc(userId);
    }

    public Income getIncomeByIdAndUserId(Long id, Long userId) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income not found with id: " + id));
        if (!income.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to access this income");
        }
        return income;
    }

    @Transactional
    public Income createIncome(IncomeDTO incomeDTO, Long userId) {
        User user = userService.getUserById(userId);
        
        Income income = Income.builder()
                .user(user)
                .source(incomeDTO.getSource())
                .amount(incomeDTO.getAmount())
                .description(incomeDTO.getDescription())
                .date(incomeDTO.getDate())
                .build();
                
        return incomeRepository.save(income);
    }

    @Transactional
    public Income updateIncome(Long id, IncomeDTO incomeDTO, Long userId) {
        Income income = getIncomeByIdAndUserId(id, userId);
        
        income.setSource(incomeDTO.getSource());
        income.setAmount(incomeDTO.getAmount());
        income.setDescription(incomeDTO.getDescription());
        income.setDate(incomeDTO.getDate());
        
        return incomeRepository.save(income);
    }

    @Transactional
    public void deleteIncome(Long id, Long userId) {
        Income income = getIncomeByIdAndUserId(id, userId);
        incomeRepository.delete(income);
    }
}
