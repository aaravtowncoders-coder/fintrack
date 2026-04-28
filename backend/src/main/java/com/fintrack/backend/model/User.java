package com.fintrack.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document(collection = "users")
public class User {

    @Id
    private String id;
    private String name;
    private String email;
    private String password;
    private String phone;

    // Gamification
    private Integer xp;
    private Integer level;
    private Integer completedChallenges;

    // Settings
    private Map<String, String> preferences;   // language, currency, timezone, dateFormat, budgetStartDay
    private Map<String, Boolean> notifications; // email, push, weekly, monthly, budget, challenge

    public User() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Integer getXp() { return xp; }
    public void setXp(Integer xp) { this.xp = xp; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public Integer getCompletedChallenges() { return completedChallenges; }
    public void setCompletedChallenges(Integer completedChallenges) { this.completedChallenges = completedChallenges; }

    public Map<String, String> getPreferences() { return preferences; }
    public void setPreferences(Map<String, String> preferences) { this.preferences = preferences; }

    public Map<String, Boolean> getNotifications() { return notifications; }
    public void setNotifications(Map<String, Boolean> notifications) { this.notifications = notifications; }
}
