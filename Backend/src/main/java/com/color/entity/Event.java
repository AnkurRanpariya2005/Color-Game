package com.color.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.color.dto.Color;
import com.color.dto.EventStatus;

@Entity
@Table(name = "events")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status;  // BETTING, RESULT_WAIT, COMPLETED, CANCELLED

    @Column(name = "total_red", nullable = false)
    private Long totalRed = 0L;

    @Column(name = "total_green", nullable = false)
    private Long totalGreen = 0L;

    @Column(name = "total_blue", nullable = false)
    private Long totalBlue = 0L;

    @Enumerated(EnumType.STRING)
    private Color result;  // RED, GREEN, BLUE

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
