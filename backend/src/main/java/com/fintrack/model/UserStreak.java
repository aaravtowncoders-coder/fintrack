package com.fintrack.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_streaks")
public class UserStreak {
    @Id
    private String id;

    private String userId;
    private int currentStreak;
    private int longestStreak;
    private LocalDate lastActivityDate;
}
