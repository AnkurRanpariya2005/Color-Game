package com.color.controller;

import com.color.dto.BetRequest;
import com.color.dto.BetStatus;
import com.color.dto.EventStatus;
import com.color.entity.Bet;
import com.color.entity.Event;
import com.color.entity.User;
import com.color.repository.BetRepository;
import com.color.repository.UserRepository;
import com.color.service.SchedulerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bet")
@Slf4j
public class BetController {

    @Autowired
    private SchedulerService schedulerService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BetRepository betRepository;

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    // Place bet
    @MessageMapping("/bet")
    public void placeBet(BetRequest request) {
        Event currentEvent = schedulerService.sendEvent();
        if (currentEvent == null || currentEvent.getStatus() != EventStatus.BETTING) {
            log.warn("Bet rejected: no active betting event");
            return;
        }



        User user = userRepository.findByEmail(request.getUserId());
        user.setBalance(user.getBalance()-request.getAmount());
        Bet bet = Bet.builder()
                .event(currentEvent)
                .user(user)
                .color(request.getColor())
                .amount(request.getAmount())
                .status(BetStatus.PLACED)
                .build();
        betRepository.save(bet);
        userRepository.save(user);

        // Update totals
        switch (request.getColor()) {
            case RED -> currentEvent.setTotalRed(currentEvent.getTotalRed() + request.getAmount());
            case GREEN -> currentEvent.setTotalGreen(currentEvent.getTotalGreen() + request.getAmount());
            case BLUE -> currentEvent.setTotalBlue(currentEvent.getTotalBlue() + request.getAmount());
        }

        simpMessagingTemplate.convertAndSend("/topic/events", currentEvent);
        log.info("Bet placed by user {} on {}:", request.getColor(), request.getAmount());
    }


}
