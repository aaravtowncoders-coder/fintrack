package com.fintrack.backend.repository;

import com.fintrack.backend.model.Income;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface IncomeRepository extends MongoRepository<Income, String> {
    List<Income> findByUserId(String userId);
    void deleteByUserId(String userId);
}
