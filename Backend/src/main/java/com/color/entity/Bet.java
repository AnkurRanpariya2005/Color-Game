package com.color.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.color.dto.BetStatus;
import com.color.dto.Color;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "bets")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Color color;  // RED, GREEN, BLUE

    @Column(nullable = false)
    private Long amount;  // bet amount

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BetStatus status = BetStatus.PLACED;  // PLACED, WON, LOST, REFUNDED

    private Long payout = 0L;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", updatable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
