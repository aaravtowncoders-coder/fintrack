package com.fintrack.controller;

import com.fintrack.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    @GetMapping("/monthly-trends")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyTrends(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(analyticsService.getMonthlyTrends(userDetails.getUsername()));
    }

    @GetMapping("/category-breakdown")
    public ResponseEntity<Map<String, BigDecimal>> getCategoryBreakdown(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(analyticsService.getCategoryBreakdown(userDetails.getUsername()));
    }

    @GetMapping("/income-vs-expense")
    public ResponseEntity<List<Map<String, Object>>> getIncomeVsExpense(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(analyticsService.getIncomeVsExpense(userDetails.getUsername()));
    }
}
