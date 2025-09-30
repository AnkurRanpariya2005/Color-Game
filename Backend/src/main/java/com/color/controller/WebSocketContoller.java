package com.color.controller;

import com.color.entity.Event;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketContoller {

    private SimpMessagingTemplate simpMessagingTemplate;

    public void sendEvent(Event event)
    {
        String destination = "/topic/event";
        simpMessagingTemplate.convertAndSend(destination,event);
    }


}
