package com.fintrack.repository;

import com.fintrack.model.UserStreak;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserStreakRepository extends MongoRepository<UserStreak, String> {
    Optional<UserStreak> findByUserId(String userId);
}
