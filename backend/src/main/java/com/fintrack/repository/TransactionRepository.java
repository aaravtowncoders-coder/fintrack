package com.fintrack.repository;

import com.fintrack.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findByUserIdOrderByDateDesc(String userId);
    List<Transaction> findByUserIdAndType(String userId, String type);
    List<Transaction> findByUserIdAndDateBetween(String userId, LocalDate start, LocalDate end);
    List<Transaction> findTop5ByUserIdOrderByDateDesc(String userId);
}
