package com.fintrack.backend.controller;

import com.fintrack.backend.model.Expense;
import com.fintrack.backend.repository.ExpenseRepository;
import com.fintrack.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    ExpenseRepository expenseRepository;

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public List<Expense> getAllExpenses() {
        return expenseRepository.findByUserId(getCurrentUserId());
    }

    @PostMapping
    public Expense createExpense(@RequestBody Expense expense) {
        expense.setUserId(getCurrentUserId());
        return expenseRepository.save(expense);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable("id") String id, @RequestBody Expense expense) {
        Optional<Expense> expenseData = expenseRepository.findById(id);

        if (expenseData.isPresent() && expenseData.get().getUserId().equals(getCurrentUserId())) {
            Expense _expense = expenseData.get();
            _expense.setDescription(expense.getDescription());
            _expense.setAmount(expense.getAmount());
            _expense.setCategory(expense.getCategory());
            _expense.setDate(expense.getDate());
            _expense.setTags(expense.getTags());
            return ResponseEntity.ok(expenseRepository.save(_expense));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteExpense(@PathVariable("id") String id) {
        try {
            Optional<Expense> expenseData = expenseRepository.findById(id);
            if (expenseData.isPresent() && expenseData.get().getUserId().equals(getCurrentUserId())) {
                expenseRepository.deleteById(id);
                return ResponseEntity.ok("Expense deleted successfully.");
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
