package com.fintrack.backend.controller;

import com.fintrack.backend.model.Challenge;
import com.fintrack.backend.model.User;
import com.fintrack.backend.repository.ChallengeRepository;
import com.fintrack.backend.repository.UserRepository;
import com.fintrack.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/challenges")
public class ChallengeController {

    @Autowired
    ChallengeRepository challengeRepository;

    @Autowired
    UserRepository userRepository;

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public List<Challenge> getAllChallenges() {
        return challengeRepository.findByUserId(getCurrentUserId());
    }

    @PostMapping
    public Challenge createChallenge(@RequestBody Challenge challenge) {
        challenge.setUserId(getCurrentUserId());
        if (challenge.getCurrent() == null) challenge.setCurrent(0.0);
        if (challenge.getCompleted() == null) challenge.setCompleted(false);
        if (challenge.getDaysLeft() == null) challenge.setDaysLeft(30);
        if (challenge.getUnit() == null) challenge.setUnit("₹");
        if (challenge.getReward() == null) {
            challenge.setReward("Hard".equals(challenge.getDifficulty()) ? 200 :
                    "Medium".equals(challenge.getDifficulty()) ? 100 : 50);
        }
        challenge.setCreatedDate(LocalDate.now().toString());
        return challengeRepository.save(challenge);
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<?> logProgress(@PathVariable("id") String id, @RequestBody Map<String, Double> body) {
        Optional<Challenge> challengeData = challengeRepository.findById(id);
        if (challengeData.isEmpty() || !challengeData.get().getUserId().equals(getCurrentUserId())) {
            return ResponseEntity.notFound().build();
        }

        Challenge challenge = challengeData.get();
        double amount = body.getOrDefault("amount", 0.0);
        if (amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Amount must be positive."));
        }

        double newCurrent = Math.min(challenge.getCurrent() + amount, challenge.getGoal());
        challenge.setCurrent(newCurrent);

        // Auto-complete if goal reached
        if (newCurrent >= challenge.getGoal() && !Boolean.TRUE.equals(challenge.getCompleted())) {
            challenge.setCompleted(true);
            challenge.setDaysLeft(0);

            // Award XP to user
            String userId = getCurrentUserId();
            Optional<User> userData = userRepository.findById(userId);
            if (userData.isPresent()) {
                User user = userData.get();
                int currentXp = user.getXp() != null ? user.getXp() : 0;
                int currentCompleted = user.getCompletedChallenges() != null ? user.getCompletedChallenges() : 0;
                user.setXp(currentXp + (challenge.getReward() != null ? challenge.getReward() : 0));
                user.setCompletedChallenges(currentCompleted + 1);

                // Level up every 1000 XP
                int newXp = user.getXp();
                user.setLevel(Math.max(1, newXp / 1000 + 1));

                userRepository.save(user);
            }
        }

        Challenge saved = challengeRepository.save(challenge);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteChallenge(@PathVariable("id") String id) {
        try {
            Optional<Challenge> challengeData = challengeRepository.findById(id);
            if (challengeData.isPresent() && challengeData.get().getUserId().equals(getCurrentUserId())) {
                challengeRepository.deleteById(id);
                return ResponseEntity.ok("Challenge deleted successfully.");
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
