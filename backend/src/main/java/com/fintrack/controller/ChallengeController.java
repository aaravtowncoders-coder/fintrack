package com.fintrack.controller;

import com.fintrack.dto.ChallengeRequest;
import com.fintrack.dto.ChallengeResponse;
import com.fintrack.service.ChallengeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
public class ChallengeController {
    private final ChallengeService challengeService;

    @GetMapping
    public ResponseEntity<List<ChallengeResponse>> getChallenges(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(challengeService.getChallenges(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<ChallengeResponse> createChallenge(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChallengeRequest request) {
        return ResponseEntity.ok(challengeService.createChallenge(userDetails.getUsername(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChallengeResponse> updateChallenge(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id,
            @Valid @RequestBody ChallengeRequest request) {
        return ResponseEntity.ok(challengeService.updateChallenge(userDetails.getUsername(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChallenge(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String id) {
        challengeService.deleteChallenge(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
