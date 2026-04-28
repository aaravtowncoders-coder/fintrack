package com.fintrack.service;

import com.fintrack.dto.PasswordChangeRequest;
import com.fintrack.dto.ProfileUpdateRequest;
import com.fintrack.model.User;
import com.fintrack.repository.TransactionRepository;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    public Map<String, Object> getProfile(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        long totalTransactions = transactionRepository.findByUserIdOrderByDateDesc(user.getId()).size();

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("createdAt", user.getCreatedAt());
        profile.put("totalTransactions", totalTransactions);
        return profile;
    }

    public Map<String, Object> updateProfile(String email, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        userRepository.save(user);
        return getProfile(request.getEmail());
    }

    public void changePassword(String email, PasswordChangeRequest request) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
