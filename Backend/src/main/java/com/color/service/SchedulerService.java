package com.color.service;

import com.color.controller.WebSocketContoller;
import com.color.dto.EventStatus;
import com.color.dto.StatusDto;
import com.color.entity.Event;
import com.color.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class SchedulerService {

    private final EventRepository eventRepository;


    private final SimpMessagingTemplate simpMessagingTemplate;

    private Event currentEvent;

    private final WebSocketContoller webSocketContoller;

    @MessageMapping("/app/join")
    @SendTo("/topic/players")  // All clients subscribed here will get update
    public Event handleNewPlayer(String username) {
        log.info("New player joined########################: " + username);
        return currentEvent;
        // simpMessagingTemplate.convertAndSend("/topic/players", currentEvent);
    }

    
    /**
     * 
     * Runs every 70 seconds
     */
    @Scheduled(fixedRate = 70000)
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
    @Scheduled(fixedRate = 1000) // every 1 min
    public void updateEventStatus() {
        if (currentEvent == null) return;

        LocalDateTime now = LocalDateTime.now();

        StatusDto statusDto = new StatusDto();
        statusDto.setEventId(currentEvent.getId());
        statusDto.setStatus(currentEvent.getStatus().name());

        // Betting phase
        if (now.isBefore(currentEvent.getEndAt())) {
            currentEvent.setStatus(EventStatus.BETTING);
            simpMessagingTemplate.convertAndSend("/topic/status", statusDto);
        }
        // Result wait phase (10 sec after betting ends)
        else if (now.isBefore(currentEvent.getEndAt().plusSeconds(10))) {

            currentEvent.setStatus(EventStatus.RESULT_WAIT);
            simpMessagingTemplate.convertAndSend("/topic/status", statusDto);
        }
        // Completed (before next event spawns)
        else {
            currentEvent.setStatus(EventStatus.COMPLETED);
            simpMessagingTemplate.convertAndSend("/topic/status", statusDto);
        }
        eventRepository.save(currentEvent);
    }
}
