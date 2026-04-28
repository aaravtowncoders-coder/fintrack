package com.fintrack.repository;

import com.fintrack.model.Challenge;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChallengeRepository extends MongoRepository<Challenge, String> {
    List<Challenge> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Challenge> findByUserIdAndStatus(String userId, String status);
}
