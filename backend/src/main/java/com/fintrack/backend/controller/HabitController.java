package com.fintrack.backend.controller;

import com.fintrack.backend.model.Habit;
import com.fintrack.backend.repository.HabitRepository;
import com.fintrack.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/habits")
public class HabitController {

    @Autowired
    HabitRepository habitRepository;

    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public List<Habit> getAllHabits() {
        return habitRepository.findByUserId(getCurrentUserId());
    }

    @PostMapping
    public Habit createHabit(@RequestBody Habit habit) {
        habit.setUserId(getCurrentUserId());
        if (habit.getCompletedDates() == null) {
            habit.setCompletedDates(List.of());
        }
        if (habit.getCurrentStreak() == null) habit.setCurrentStreak(0);
        if (habit.getTotalSaved() == null) habit.setTotalSaved(0L);
        return habitRepository.save(habit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Habit> updateHabit(@PathVariable("id") String id, @RequestBody Habit habit) {
        Optional<Habit> habitData = habitRepository.findById(id);

        if (habitData.isPresent() && habitData.get().getUserId().equals(getCurrentUserId())) {
            Habit _habit = habitData.get();
            _habit.setName(habit.getName());
            _habit.setCategory(habit.getCategory());
            _habit.setFrequency(habit.getFrequency());
            _habit.setTargetDays(habit.getTargetDays());
            _habit.setCurrentStreak(habit.getCurrentStreak());
            _habit.setSavingsPerAction(habit.getSavingsPerAction());
            _habit.setTotalSaved(habit.getTotalSaved());
            _habit.setCompletedDates(habit.getCompletedDates());
            return ResponseEntity.ok(habitRepository.save(_habit));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteHabit(@PathVariable("id") String id) {
        try {
            Optional<Habit> habitData = habitRepository.findById(id);
            if (habitData.isPresent() && habitData.get().getUserId().equals(getCurrentUserId())) {
                habitRepository.deleteById(id);
                return ResponseEntity.ok("Habit deleted successfully.");
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
