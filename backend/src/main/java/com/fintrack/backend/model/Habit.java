package com.fintrack.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "habits")
public class Habit {
    @Id
    private String id;
    private String name;
    private String category;
    private String frequency;
    private Integer targetDays;
    private Integer currentStreak;
    private Long savingsPerAction;
    private Long totalSaved;
    private List<String> completedDates;
    private String userId;

    public Habit() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public Integer getTargetDays() { return targetDays; }
    public void setTargetDays(Integer targetDays) { this.targetDays = targetDays; }

    public Integer getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }

    public Long getSavingsPerAction() { return savingsPerAction; }
    public void setSavingsPerAction(Long savingsPerAction) { this.savingsPerAction = savingsPerAction; }

    public Long getTotalSaved() { return totalSaved; }
    public void setTotalSaved(Long totalSaved) { this.totalSaved = totalSaved; }

    public List<String> getCompletedDates() { return completedDates; }
    public void setCompletedDates(List<String> completedDates) { this.completedDates = completedDates; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
