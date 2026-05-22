package com.expensetracker.controller;

import com.expensetracker.dto.AuthResponse;
import com.expensetracker.model.User;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        User user = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(new AuthResponse(
                null, // Token is not needed for profile checks
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getMonthlyBudget()
        ));
    }

    @PutMapping("/budget")
    public ResponseEntity<?> updateBudget(
            @RequestBody Map<String, BigDecimal> budgetRequest,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        BigDecimal budget = budgetRequest.get("monthlyBudget");
        User user = userService.updateMonthlyBudget(currentUser.getId(), budget);
        
        return ResponseEntity.ok(new AuthResponse(
                null,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getMonthlyBudget()
        ));
    }
}
