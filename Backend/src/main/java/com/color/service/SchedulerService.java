package com.color.service;

import com.color.controller.WebSocketContoller;
import com.color.dto.EventStatus;
import com.color.entity.Event;
import com.color.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class SchedulerService {

    private final EventRepository eventRepository;

    private final SimpMessagingTemplate simpMessagingTemplate;

    private Event currentEvent;

    private final WebSocketContoller webSocketContoller;

    /**
     * Runs every 70 seconds
     */
    @Scheduled(fixedRate = 1000)
    public void scheduleEvent() {
        // End previous event if exists
        if (currentEvent != null) {
            currentEvent.setStatus(EventStatus.COMPLETED);
            eventRepository.save(currentEvent);
        }

        // Create new event
        LocalDateTime now = LocalDateTime.now();
        Event event = Event.builder()
                .startAt(now)
                .endAt(now.plusSeconds(60)) // 1 min betting
                .status(EventStatus.BETTING)
                .totalRed(0L)
                .totalGreen(0L)
                .totalBlue(0L)
                .build();

        currentEvent = eventRepository.save(event);

        // You can broadcast here using WebSocket (e.g. send event to all users)
        System.out.println("New event created: " + currentEvent.getId());
        System.out.println(currentEvent);
        simpMessagingTemplate.convertAndSend("/topic/events", currentEvent);
    }

    /**
     * Runs every 70 sec but with delay inside lifecycle.
     * You can track phases (BETTING → RESULT_WAIT → COMPLETED).
     */
    @Scheduled(fixedRate = 1000) // every 1 sec
    public void updateEventStatus() {
        if (currentEvent == null) return;

        LocalDateTime now = LocalDateTime.now();


        // Betting phase
        if (now.isBefore(currentEvent.getEndAt())) {
            currentEvent.setStatus(EventStatus.BETTING);
        }
        // Result wait phase (10 sec after betting ends)
        else if (now.isBefore(currentEvent.getEndAt().plusSeconds(10))) {
            currentEvent.setStatus(EventStatus.RESULT_WAIT);
        }
        // Completed (before next event spawns)
        else {
            currentEvent.setStatus(EventStatus.COMPLETED);
        }

        eventRepository.save(currentEvent);
    }
}
