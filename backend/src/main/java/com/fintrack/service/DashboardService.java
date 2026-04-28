package com.fintrack.service;

import com.fintrack.dto.DashboardStats;
import com.fintrack.dto.TransactionResponse;
import com.fintrack.model.Transaction;
import com.fintrack.model.User;
import com.fintrack.repository.ChallengeRepository;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final TransactionRepository transactionRepository;
    private final ChallengeRepository challengeRepository;
    private final UserRepository userRepository;

    public DashboardStats getStats(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        String userId = user.getId();

        List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateDesc(userId);

        BigDecimal totalIncome = transactions.stream()
            .filter(t -> "INCOME".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = transactions.stream()
            .filter(t -> "EXPENSE".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> expenseByCategory = new HashMap<>();
        transactions.stream()
            .filter(t -> "EXPENSE".equals(t.getType()))
            .forEach(t -> expenseByCategory.merge(t.getCategory(), t.getAmount(), BigDecimal::add));

        List<TransactionResponse> recentTransactions = transactionRepository.findTop5ByUserIdOrderByDateDesc(userId)
            .stream().map(t -> TransactionResponse.builder()
                .id(t.getId())
                .type(t.getType())
                .category(t.getCategory())
                .amount(t.getAmount())
                .description(t.getDescription())
                .date(t.getDate())
                .createdAt(t.getCreatedAt())
                .build())
            .collect(Collectors.toList());

        long activeChallenges = challengeRepository.findByUserIdAndStatus(userId, "ACTIVE").size();

        return DashboardStats.builder()
            .totalIncome(totalIncome)
            .totalExpense(totalExpense)
            .balance(totalIncome.subtract(totalExpense))
            .activeChallenges(activeChallenges)
            .recentTransactions(recentTransactions)
            .expenseByCategory(expenseByCategory)
            .build();
    }
}
