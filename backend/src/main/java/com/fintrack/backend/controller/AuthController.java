package com.fintrack.backend.controller;

import com.fintrack.backend.model.PasswordResetToken;
import com.fintrack.backend.model.User;
import com.fintrack.backend.payload.request.LoginRequest;
import com.fintrack.backend.payload.request.SignupRequest;
import com.fintrack.backend.payload.response.JwtResponse;
import com.fintrack.backend.payload.response.MessageResponse;
import com.fintrack.backend.repository.PasswordResetTokenRepository;
import com.fintrack.backend.repository.UserRepository;
import com.fintrack.backend.security.jwt.JwtUtils;
import com.fintrack.backend.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    PasswordResetTokenRepository passwordResetTokenRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate token with extended expiry if remember-me is checked
        String jwt;
        if (Boolean.TRUE.equals(loginRequest.getRememberMe())) {
            jwt = jwtUtils.generateRememberMeToken(authentication);
        } else {
            jwt = jwtUtils.generateJwtToken(authentication);
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getUsername()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setXp(0);
        user.setLevel(1);
        user.setCompletedChallenges(0);

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId()).orElse(null);

        java.util.Map<String, Object> profile = new java.util.LinkedHashMap<>();
        profile.put("id", userDetails.getId());
        profile.put("name", userDetails.getName());
        profile.put("email", userDetails.getUsername());

        if (user != null) {
            profile.put("xp", user.getXp() != null ? user.getXp() : 0);
            profile.put("level", user.getLevel() != null ? user.getLevel() : 1);
            profile.put("completedChallenges", user.getCompletedChallenges() != null ? user.getCompletedChallenges() : 0);
        }

        return ResponseEntity.ok(profile);
    }

    /**
     * POST /api/auth/forgot-password — generates a reset token
     * In production, this would send an email. For demo, token is returned in the response.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email is required."));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Don't reveal whether email exists — return success either way
            return ResponseEntity.ok(new MessageResponse("If the email exists, a reset token has been generated."));
        }

        // Delete any existing tokens for this email
        passwordResetTokenRepository.deleteByEmail(email);

        // Generate new token
        String token = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        PasswordResetToken resetToken = new PasswordResetToken(email, token, LocalDateTime.now().plusHours(1));
        passwordResetTokenRepository.save(resetToken);

        // In a real app, you'd email this token. For demo, return it.
        Map<String, String> response = new java.util.LinkedHashMap<>();
        response.put("message", "Password reset token generated. Use it to reset your password.");
        response.put("resetToken", token);
        response.put("note", "In production, this token would be emailed to you.");

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/reset-password — resets password using token
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");

        if (token == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Token and new password (min 6 chars) are required."));
        }

        Optional<PasswordResetToken> resetTokenOpt = passwordResetTokenRepository.findByToken(token);
        if (resetTokenOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Invalid reset token."));
        }

        PasswordResetToken resetToken = resetTokenOpt.get();
        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Reset token has expired. Please request a new one."));
        }

        // Find user and update password
        Optional<User> userOpt = userRepository.findByEmail(resetToken.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("User not found."));
        }

        User user = userOpt.get();
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);

        // Delete the used token
        passwordResetTokenRepository.delete(resetToken);

        return ResponseEntity.ok(new MessageResponse("Password reset successfully! You can now log in."));
    }
}
