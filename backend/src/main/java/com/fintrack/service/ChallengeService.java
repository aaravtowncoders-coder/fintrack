package com.fintrack.service;

import com.fintrack.dto.ChallengeRequest;
import com.fintrack.dto.ChallengeResponse;
import com.fintrack.model.Challenge;
import com.fintrack.model.User;
import com.fintrack.repository.ChallengeRepository;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChallengeService {
    private final ChallengeRepository challengeRepository;
    private final UserRepository userRepository;

    private String getUserId(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return user.getId();
    }

    public List<ChallengeResponse> getChallenges(String email) {
        String userId = getUserId(email);
        return challengeRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ChallengeResponse createChallenge(String email, ChallengeRequest request) {
        String userId = getUserId(email);
        Challenge challenge = Challenge.builder()
            .userId(userId)
            .title(request.getTitle())
            .targetAmount(request.getTargetAmount())
            .currentAmount(request.getCurrentAmount() != null ? request.getCurrentAmount() : BigDecimal.ZERO)
            .deadline(request.getDeadline())
            .status("ACTIVE")
            .createdAt(LocalDateTime.now())
            .build();
        return toResponse(challengeRepository.save(challenge));
    }

    public ChallengeResponse updateChallenge(String email, String id, ChallengeRequest request) {
        String userId = getUserId(email);
        Challenge challenge = challengeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Challenge not found"));
        if (!challenge.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        challenge.setTitle(request.getTitle());
        challenge.setTargetAmount(request.getTargetAmount());
        if (request.getCurrentAmount() != null) {
            challenge.setCurrentAmount(request.getCurrentAmount());
        }
        challenge.setDeadline(request.getDeadline());
        if (challenge.getCurrentAmount().compareTo(challenge.getTargetAmount()) >= 0) {
            challenge.setStatus("COMPLETED");
        }
        return toResponse(challengeRepository.save(challenge));
    }

    public void deleteChallenge(String email, String id) {
        String userId = getUserId(email);
        Challenge challenge = challengeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Challenge not found"));
        if (!challenge.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        challengeRepository.delete(challenge);
    }

    private ChallengeResponse toResponse(Challenge c) {
        double progress = 0;
        if (c.getTargetAmount() != null && c.getTargetAmount().compareTo(BigDecimal.ZERO) > 0 && c.getCurrentAmount() != null) {
            progress = c.getCurrentAmount().divide(c.getTargetAmount(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue();
        }
        return ChallengeResponse.builder()
            .id(c.getId())
            .title(c.getTitle())
            .targetAmount(c.getTargetAmount())
            .currentAmount(c.getCurrentAmount())
            .deadline(c.getDeadline())
            .status(c.getStatus())
            .createdAt(c.getCreatedAt())
            .progressPercentage(Math.min(progress, 100))
            .build();
    }
}
