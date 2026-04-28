package com.fintrack.service;

import com.fintrack.model.Transaction;
import com.fintrack.model.User;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private String getUserId(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return user.getId();
    }

    public List<Map<String, Object>> getMonthlyTrends(String email) {
        String userId = getUserId(email);
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateDesc(userId);

        Map<String, BigDecimal[]> monthlyData = new TreeMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(5).withDayOfMonth(1);

        for (Transaction t : transactions) {
            if (t.getDate().isBefore(sixMonthsAgo)) continue;
            String month = t.getDate().format(formatter);
            monthlyData.computeIfAbsent(month, k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            if ("INCOME".equals(t.getType())) {
                monthlyData.get(month)[0] = monthlyData.get(month)[0].add(t.getAmount());
            } else {
                monthlyData.get(month)[1] = monthlyData.get(month)[1].add(t.getAmount());
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, BigDecimal[]> entry : monthlyData.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("month", entry.getKey());
            item.put("income", entry.getValue()[0]);
            item.put("expense", entry.getValue()[1]);
            result.add(item);
        }
        return result;
    }

    public Map<String, BigDecimal> getCategoryBreakdown(String email) {
        String userId = getUserId(email);
        List<Transaction> transactions = transactionRepository.findByUserIdAndType(userId, "EXPENSE");
        Map<String, BigDecimal> breakdown = new HashMap<>();
        for (Transaction t : transactions) {
            breakdown.merge(t.getCategory(), t.getAmount(), BigDecimal::add);
        }
        return breakdown;
    }

    public List<Map<String, Object>> getIncomeVsExpense(String email) {
        return getMonthlyTrends(email);
    }
}
