package com.color.service;

import com.color.controller.WebSocketContoller;
import com.color.dto.BetStatus;
import com.color.dto.Color;
import com.color.dto.EventStatus;
import com.color.dto.StatusDto;
import com.color.entity.Bet;
import com.color.entity.Event;
import com.color.repository.BetRepository;
import com.color.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SchedulerService {

    private final EventRepository eventRepository;


    private final SimpMessagingTemplate simpMessagingTemplate;

    private Event currentEvent;

    private final BetRepository betRepository;





    public Event sendEvent(){
        return currentEvent;
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

    // Calculate result
    private void resolveEvent(Event event) {
        if (event.getResult() != null) return;

        Color winningColor = pickRandomColor();
        event.setResult(winningColor);
        event.setStatus(EventStatus.RESULT_WAIT);

        List<Bet> bets = betRepository.findByEvent(event);
        for (Bet b : bets) {
            if (b.getColor() == winningColor) {
                b.setStatus(BetStatus.WON);
                b.setPayout(b.getAmount() * 2);
            } else {
                b.setStatus(BetStatus.LOST);
                b.setPayout(0L);
            }
            betRepository.save(b);
        }

        simpMessagingTemplate.convertAndSend("/topic/results", event);
        log.info("Event {} resolved. Winner: {}", event.getId(), winningColor);
    }

    private Color pickRandomColor() {
        Color[] colors = Color.values();
        int idx = (int) (Math.random() * colors.length);
        return colors[idx];
    }

}
