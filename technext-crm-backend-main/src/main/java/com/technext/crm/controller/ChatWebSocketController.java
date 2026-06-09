package com.technext.crm.controller;

import com.technext.crm.model.Message;
import com.technext.crm.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.time.LocalDateTime;

@Controller
public class ChatWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageService messageService;

    // Handle channel messages
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Message message) {
        message.setCreatedAt(LocalDateTime.now());
        message.setIsRead(false);
        Message saved = messageService.sendMessage(message);
        // Broadcast to channel subscribers
        messagingTemplate.convertAndSend(
            "/topic/channel." + message.getChannel(), saved);
    }

    // Handle direct messages
    @MessageMapping("/chat.direct")
    public void sendDirectMessage(@Payload Message message) {
        message.setCreatedAt(LocalDateTime.now());
        message.setIsRead(false);
        Message saved = messageService.sendMessage(message);
        // Send to both sender and receiver
        messagingTemplate.convertAndSendToUser(
            message.getReceiverId().toString(), "/queue/messages", saved);
        messagingTemplate.convertAndSendToUser(
            message.getSenderId().toString(), "/queue/messages", saved);
    }

    // Notify typing indicator
    @MessageMapping("/chat.typing")
    public void typingIndicator(@Payload Message message) {
        messagingTemplate.convertAndSend(
            "/topic/channel." + message.getChannel() + ".typing",
            message.getSenderName() + " is typing...");
    }
}