package com.technext.crm.controller;

import com.technext.crm.model.Message;
import com.technext.crm.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:3000")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/channel/{channel}")
    public List<Message> getChannelMessages(@PathVariable String channel) {
        return messageService.getChannelMessages(channel);
    }

    @GetMapping("/direct/{user1}/{user2}")
    public List<Message> getDirectMessages(@PathVariable Integer user1, @PathVariable Integer user2) {
        return messageService.getDirectMessages(user1, user2);
    }

    @GetMapping("/unread/{userId}")
    public List<Message> getUnreadMessages(@PathVariable Integer userId) {
        return messageService.getUnreadMessages(userId);
    }

    @GetMapping("/unread/count/{userId}")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Integer userId) {
        return ResponseEntity.ok(Map.of("count", messageService.getUnreadCount(userId)));
    }

    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        return ResponseEntity.ok(messageService.sendMessage(message));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Integer id) {
        messageService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/channel/{channel}/read/{userId}")
    public ResponseEntity<Void> markChannelAsRead(@PathVariable String channel, @PathVariable Integer userId) {
        messageService.markChannelAsRead(channel, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Integer id) {
        messageService.deleteMessage(id);
        return ResponseEntity.ok().build();
    }
}