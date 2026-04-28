package com.fintrack.backend.controller;

import com.fintrack.backend.model.Income;
import com.fintrack.backend.repository.IncomeRepository;
import com.fintrack.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/income")
public class IncomeController {

    @Autowired
    IncomeRepository incomeRepository;

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public List<Income> getAllIncome() {
        return incomeRepository.findByUserId(getCurrentUserId());
    }

    @PostMapping
    public Income createIncome(@RequestBody Income income) {
        income.setUserId(getCurrentUserId());
        return incomeRepository.save(income);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteIncome(@PathVariable("id") String id) {
        try {
            Optional<Income> incomeData = incomeRepository.findById(id);
            if (incomeData.isPresent() && incomeData.get().getUserId().equals(getCurrentUserId())) {
                incomeRepository.deleteById(id);
                return ResponseEntity.ok("Income deleted successfully.");
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
