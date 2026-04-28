package com.fintrack.backend.controller;

import com.fintrack.backend.model.*;
import com.fintrack.backend.payload.response.MessageResponse;
import com.fintrack.backend.repository.*;
import com.fintrack.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private ChallengeRepository challengeRepository;

    @Autowired
    private IncomeRepository incomeRepository;

    /**
     * GET /api/profile — return the current user's profile
     */
    @GetMapping
    public ResponseEntity<?> getProfile() {
        UserDetailsImpl userDetails = getCurrentUser();
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("phone", user.getPhone() != null ? user.getPhone() : "");
        profile.put("xp", user.getXp() != null ? user.getXp() : 0);
        profile.put("level", user.getLevel() != null ? user.getLevel() : 1);
        profile.put("completedChallenges", user.getCompletedChallenges() != null ? user.getCompletedChallenges() : 0);
        profile.put("preferences", user.getPreferences() != null ? user.getPreferences() : new HashMap<>());
        profile.put("notifications", user.getNotifications() != null ? user.getNotifications() : new HashMap<>());
        return ResponseEntity.ok(profile);
    }

    /**
     * PUT /api/profile — update name and phone
     */
    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body) {
        UserDetailsImpl userDetails = getCurrentUser();
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (body.containsKey("name")) {
            user.setName(body.get("name"));
        }
        if (body.containsKey("phone")) {
            user.setPhone(body.get("phone"));
        }

        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Profile updated successfully!"));
    }

    /**
     * PUT /api/profile/password — change password
     */
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("New password must be at least 8 characters."));
        }

        UserDetailsImpl userDetails = getCurrentUser();
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        if (!encoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Current password is incorrect."));
        }

        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Password changed successfully!"));
    }

    /**
     * PUT /api/profile/preferences — save user preferences
     */
    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@RequestBody Map<String, String> preferences) {
        UserDetailsImpl userDetails = getCurrentUser();
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        user.setPreferences(preferences);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Preferences saved successfully!"));
    }

    /**
     * PUT /api/profile/notifications — save notification settings
     */
    @PutMapping("/notifications")
    public ResponseEntity<?> updateNotifications(@RequestBody Map<String, Boolean> notifications) {
        UserDetailsImpl userDetails = getCurrentUser();
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        user.setNotifications(notifications);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Notification settings saved successfully!"));
    }

    /**
     * DELETE /api/profile — delete user account and all related data
     */
    @DeleteMapping
    public ResponseEntity<?> deleteAccount() {
        UserDetailsImpl userDetails = getCurrentUser();
        String userId = userDetails.getId();

        // Delete all user data
        expenseRepository.deleteByUserId(userId);
        habitRepository.deleteByUserId(userId);
        challengeRepository.deleteByUserId(userId);
        incomeRepository.deleteByUserId(userId);
        userRepository.deleteById(userId);

        return ResponseEntity.ok(new MessageResponse("Account deleted successfully."));
    }

    /**
     * GET /api/profile/data — download all user data as JSON
     */
    @GetMapping("/data")
    public ResponseEntity<?> downloadData() {
        UserDetailsImpl userDetails = getCurrentUser();
        String userId = userDetails.getId();

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        List<Expense> expenses = expenseRepository.findByUserId(userId);
        List<Habit> habits = habitRepository.findByUserId(userId);
        List<Challenge> challenges = challengeRepository.findByUserId(userId);
        List<Income> incomes = incomeRepository.findByUserId(userId);

        Map<String, Object> data = new HashMap<>();
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("name", user.getName());
        profileData.put("email", user.getEmail());
        profileData.put("phone", user.getPhone());
        data.put("profile", profileData);
        data.put("expenses", expenses);
        data.put("habits", habits);
        data.put("challenges", challenges);
        data.put("income", incomes);

        return ResponseEntity.ok(data);
    }

    private UserDetailsImpl getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (UserDetailsImpl) authentication.getPrincipal();
    }
}
