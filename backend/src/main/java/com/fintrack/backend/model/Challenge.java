package com.fintrack.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "challenges")
public class Challenge {

    @Id
    private String id;
    private String title;
    private String description;
    private Double goal;
    private Double current;
    private String unit; // "₹" or "days"
    private Integer daysLeft;
    private Integer reward; // XP
    private String difficulty; // Easy, Medium, Hard
    private Boolean completed;
    private String userId;
    private String createdDate;

    public Challenge() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getGoal() { return goal; }
    public void setGoal(Double goal) { this.goal = goal; }

    public Double getCurrent() { return current; }
    public void setCurrent(Double current) { this.current = current; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Integer getDaysLeft() { return daysLeft; }
    public void setDaysLeft(Integer daysLeft) { this.daysLeft = daysLeft; }

    public Integer getReward() { return reward; }
    public void setReward(Integer reward) { this.reward = reward; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getCreatedDate() { return createdDate; }
    public void setCreatedDate(String createdDate) { this.createdDate = createdDate; }
}
