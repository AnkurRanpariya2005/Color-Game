package com.color.controller;

import com.color.entity.Event;
import com.color.service.SchedulerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j
public class EventController {

    @Autowired
    private SchedulerService schedulerService;

    @MessageMapping("/join")
    @SendTo("/topic/players")  // All clients subscribed here will get update
    public Event handleNewPlayer() {
        log.info("New player joined########################: ");
        return schedulerService.sendEvent();
        // simpMessagingTemplate.convertAndSend("/topic/players", currentEvent);
    }
}
