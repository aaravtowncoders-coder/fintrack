package com.fintrack.backend.controller;

import com.fintrack.backend.model.Expense;
import com.fintrack.backend.model.Income;
import com.fintrack.backend.repository.ExpenseRepository;
import com.fintrack.backend.repository.IncomeRepository;
import com.fintrack.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    ExpenseRepository expenseRepository;

    @Autowired
    IncomeRepository incomeRepository;

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    private LocalDate parseDate(String dateStr) {
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            try {
                return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
            } catch (DateTimeParseException e2) {
                return null;
            }
        }
    }

    /**
     * GET /api/stats/summary?months=6
     * Returns: totalIncome, totalExpenses, totalSavings, monthlyExpenses, budgetRemaining
     */
    @GetMapping("/summary")
    public Map<String, Object> getSummary(@RequestParam(defaultValue = "6") int months) {
        String userId = getCurrentUserId();
        List<Expense> expenses = expenseRepository.findByUserId(userId);
        List<Income> incomes = incomeRepository.findByUserId(userId);

        LocalDate now = LocalDate.now();
        LocalDate cutoff = now.minusMonths(months);

        double totalIncome = incomes.stream()
                .filter(i -> { LocalDate d = parseDate(i.getDate()); return d != null && d.isAfter(cutoff); })
                .mapToDouble(Income::getAmount).sum();

        double totalExpenses = expenses.stream()
                .filter(e -> { LocalDate d = parseDate(e.getDate()); return d != null && d.isAfter(cutoff); })
                .mapToDouble(Expense::getAmount).sum();

        // Current month expenses
        YearMonth currentMonth = YearMonth.now();
        double monthlyExpenses = expenses.stream()
                .filter(e -> {
                    LocalDate d = parseDate(e.getDate());
                    return d != null && YearMonth.from(d).equals(currentMonth);
                })
                .mapToDouble(Expense::getAmount).sum();

        double monthlyIncome = incomes.stream()
                .filter(i -> {
                    LocalDate d = parseDate(i.getDate());
                    return d != null && YearMonth.from(d).equals(currentMonth);
                })
                .mapToDouble(Income::getAmount).sum();

        double totalSavings = totalIncome - totalExpenses;
        double budgetRemaining = monthlyIncome - monthlyExpenses;

        // Previous month expenses for comparison
        YearMonth prevMonth = currentMonth.minusMonths(1);
        double prevMonthExpenses = expenses.stream()
                .filter(e -> {
                    LocalDate d = parseDate(e.getDate());
                    return d != null && YearMonth.from(d).equals(prevMonth);
                })
                .mapToDouble(Expense::getAmount).sum();

        double expenseChange = prevMonthExpenses > 0
                ? ((monthlyExpenses - prevMonthExpenses) / prevMonthExpenses) * 100
                : 0;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalIncome", totalIncome);
        result.put("totalExpenses", totalExpenses);
        result.put("totalSavings", totalSavings);
        result.put("monthlyExpenses", monthlyExpenses);
        result.put("monthlyIncome", monthlyIncome);
        result.put("budgetRemaining", budgetRemaining);
        result.put("expenseChangePercent", Math.round(expenseChange * 10.0) / 10.0);
        result.put("transactionCount", expenses.size());
        return result;
    }

    /**
     * GET /api/stats/monthly?months=6
     * Returns array of {month, income, expenses, savings} for past N months
     */
    @GetMapping("/monthly")
    public List<Map<String, Object>> getMonthlyBreakdown(@RequestParam(defaultValue = "6") int months) {
        String userId = getCurrentUserId();
        List<Expense> expenses = expenseRepository.findByUserId(userId);
        List<Income> incomes = incomeRepository.findByUserId(userId);

        List<Map<String, Object>> result = new ArrayList<>();
        YearMonth now = YearMonth.now();

        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = now.minusMonths(i);
            String monthLabel = ym.getMonth().name().substring(0, 3);
            monthLabel = monthLabel.charAt(0) + monthLabel.substring(1).toLowerCase();

            double inc = incomes.stream()
                    .filter(income -> {
                        LocalDate d = parseDate(income.getDate());
                        return d != null && YearMonth.from(d).equals(ym);
                    })
                    .mapToDouble(Income::getAmount).sum();

            double exp = expenses.stream()
                    .filter(expense -> {
                        LocalDate d = parseDate(expense.getDate());
                        return d != null && YearMonth.from(d).equals(ym);
                    })
                    .mapToDouble(Expense::getAmount).sum();

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", monthLabel);
            entry.put("yearMonth", ym.toString());
            entry.put("income", inc);
            entry.put("expenses", exp);
            entry.put("savings", inc - exp);
            result.add(entry);
        }
        return result;
    }

    /**
     * GET /api/stats/category?month=2026-03
     * Returns expenses grouped by category for a given month (defaults to current)
     */
    @GetMapping("/category")
    public List<Map<String, Object>> getCategoryBreakdown(@RequestParam(required = false) String month) {
        String userId = getCurrentUserId();
        List<Expense> expenses = expenseRepository.findByUserId(userId);

        YearMonth targetMonth = month != null ? YearMonth.parse(month) : YearMonth.now();

        Map<String, Double> categoryTotals = expenses.stream()
                .filter(e -> {
                    LocalDate d = parseDate(e.getDate());
                    return d != null && YearMonth.from(d).equals(targetMonth);
                })
                .collect(Collectors.groupingBy(
                        e -> e.getCategory() != null ? e.getCategory() : "other",
                        Collectors.summingDouble(Expense::getAmount)
                ));

        Map<String, String> categoryColors = Map.of(
                "food", "#f97316", "transport", "#3b82f6", "shopping", "#a855f7",
                "housing", "#14b8a6", "entertainment", "#ec4899", "health", "#ef4444",
                "other", "#6b7280"
        );

        Map<String, String> categoryLabels = Map.of(
                "food", "Food & Dining", "transport", "Transport", "shopping", "Shopping",
                "housing", "Housing", "entertainment", "Entertainment", "health", "Health",
                "other", "Other"
        );

        List<Map<String, Object>> result = new ArrayList<>();
        categoryTotals.forEach((cat, total) -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("name", categoryLabels.getOrDefault(cat, cat));
            entry.put("category", cat);
            entry.put("value", total);
            entry.put("color", categoryColors.getOrDefault(cat, "#6b7280"));
            result.add(entry);
        });

        result.sort((a, b) -> Double.compare((Double) b.get("value"), (Double) a.get("value")));
        return result;
    }

    /**
     * GET /api/stats/weekly?month=2026-03
     * Returns weekly spending breakdown for a given month
     */
    @GetMapping("/weekly")
    public List<Map<String, Object>> getWeeklySpending(@RequestParam(required = false) String month) {
        String userId = getCurrentUserId();
        List<Expense> expenses = expenseRepository.findByUserId(userId);

        YearMonth targetMonth = month != null ? YearMonth.parse(month) : YearMonth.now();

        List<Expense> monthExpenses = expenses.stream()
                .filter(e -> {
                    LocalDate d = parseDate(e.getDate());
                    return d != null && YearMonth.from(d).equals(targetMonth);
                })
                .collect(Collectors.toList());

        // Split into 4 weeks
        List<Map<String, Object>> result = new ArrayList<>();
        double totalSpending = monthExpenses.stream().mapToDouble(Expense::getAmount).sum();
        double avgWeekly = totalSpending / 4.0;

        for (int week = 1; week <= 4; week++) {
            int startDay = (week - 1) * 7 + 1;
            int endDay = week == 4 ? targetMonth.lengthOfMonth() : week * 7;
            final int fStartDay = startDay;
            final int fEndDay = endDay;

            double weekSpending = monthExpenses.stream()
                    .filter(e -> {
                        LocalDate d = parseDate(e.getDate());
                        return d != null && d.getDayOfMonth() >= fStartDay && d.getDayOfMonth() <= fEndDay;
                    })
                    .mapToDouble(Expense::getAmount).sum();

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("week", "Week " + week);
            entry.put("spending", weekSpending);
            entry.put("avg", Math.round(avgWeekly));
            result.add(entry);
        }
        return result;
    }
}
