package com.fintrack.service;

import com.fintrack.dto.TransactionRequest;
import com.fintrack.dto.TransactionResponse;
import com.fintrack.model.Transaction;
import com.fintrack.model.User;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private String getUserId(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return user.getId();
    }

    public List<TransactionResponse> getTransactions(String email) {
        String userId = getUserId(email);
        return transactionRepository.findByUserIdOrderByDateDesc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TransactionResponse createTransaction(String email, TransactionRequest request) {
        String userId = getUserId(email);
        Transaction transaction = Transaction.builder()
            .userId(userId)
            .type(request.getType())
            .category(request.getCategory())
            .amount(request.getAmount())
            .description(request.getDescription())
            .date(request.getDate())
            .createdAt(LocalDateTime.now())
            .build();
        return toResponse(transactionRepository.save(transaction));
    }

    public TransactionResponse updateTransaction(String email, String id, TransactionRequest request) {
        String userId = getUserId(email);
        Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!transaction.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        transaction.setType(request.getType());
        transaction.setCategory(request.getCategory());
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setDate(request.getDate());
        return toResponse(transactionRepository.save(transaction));
    }

    public void deleteTransaction(String email, String id) {
        String userId = getUserId(email);
        Transaction transaction = transactionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!transaction.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        transactionRepository.delete(transaction);
    }

    public String exportCsv(String email) {
        List<TransactionResponse> transactions = getTransactions(email);
        StringWriter sw = new StringWriter();
        try (CSVWriter writer = new CSVWriter(sw)) {
            writer.writeNext(new String[]{"Date", "Type", "Category", "Amount", "Description"});
            for (TransactionResponse t : transactions) {
                writer.writeNext(new String[]{
                    t.getDate().toString(),
                    t.getType(),
                    t.getCategory(),
                    t.getAmount().toString(),
                    t.getDescription() != null ? t.getDescription() : ""
                });
            }
        } catch (Exception e) {
            throw new RuntimeException("Error generating CSV", e);
        }
        return sw.toString();
    }

    private TransactionResponse toResponse(Transaction t) {
        return TransactionResponse.builder()
            .id(t.getId())
            .type(t.getType())
            .category(t.getCategory())
            .amount(t.getAmount())
            .description(t.getDescription())
            .date(t.getDate())
            .createdAt(t.getCreatedAt())
            .build();
    }
}
