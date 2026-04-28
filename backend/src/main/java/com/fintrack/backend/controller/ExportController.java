package com.fintrack.backend.controller;

import com.fintrack.backend.model.Expense;
import com.fintrack.backend.repository.ExpenseRepository;
import com.fintrack.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/expenses")
public class ExportController {

    @Autowired
    ExpenseRepository expenseRepository;

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportExpenses() {
        List<Expense> expenses = expenseRepository.findByUserId(getCurrentUserId());

        StringBuilder csv = new StringBuilder();
        csv.append("ID,Description,Amount,Category,Date,Tags\n");

        for (Expense e : expenses) {
            csv.append(escCsv(e.getId())).append(",");
            csv.append(escCsv(e.getDescription())).append(",");
            csv.append(e.getAmount() != null ? e.getAmount() : 0).append(",");
            csv.append(escCsv(e.getCategory())).append(",");
            csv.append(escCsv(e.getDate())).append(",");
            csv.append(escCsv(e.getTags() != null ? String.join("; ", e.getTags()) : "")).append("\n");
        }

        byte[] csvBytes = csv.toString().getBytes();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "fintrack_expenses.csv");
        headers.setContentLength(csvBytes.length);

        return ResponseEntity.ok().headers(headers).body(csvBytes);
    }

    private String escCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
