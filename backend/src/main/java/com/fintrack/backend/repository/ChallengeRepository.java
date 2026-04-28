package com.fintrack.backend.repository;

import com.fintrack.backend.model.Challenge;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChallengeRepository extends MongoRepository<Challenge, String> {
    List<Challenge> findByUserId(String userId);
    long countByUserIdAndCompleted(String userId, Boolean completed);
    void deleteByUserId(String userId);
}
