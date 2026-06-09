package com.technext.crm.service;

import com.technext.crm.model.Message;
import com.technext.crm.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public List<Message> getChannelMessages(String channel) {
        return messageRepository.findByChannelOrderByCreatedAtAsc(channel);
    }

    public List<Message> getDirectMessages(Integer user1, Integer user2) {
        return messageRepository.findDirectMessages(user1, user2);
    }

    public List<Message> getUnreadMessages(Integer receiverId) {
        return messageRepository.findByReceiverIdAndIsReadFalse(receiverId);
    }

    public Message sendMessage(Message message) {
        message.setCreatedAt(LocalDateTime.now());
        if (message.getIsRead() == null) message.setIsRead(false);
        if (message.getMessageType() == null) message.setMessageType("text");
        return messageRepository.save(message);
    }

    public void markAsRead(Integer id) {
        messageRepository.findById(id).ifPresent(m -> {
            m.setIsRead(true);
            messageRepository.save(m);
        });
    }

    public void markChannelAsRead(String channel, Integer userId) {
        messageRepository.findByChannelAndIsReadFalse(channel).forEach(m -> {
            if (!m.getSenderId().equals(userId)) {
                m.setIsRead(true);
                messageRepository.save(m);
            }
        });
    }

    public void deleteMessage(Integer id) {
        messageRepository.deleteById(id);
    }

    public long getUnreadCount(Integer userId) {
        return messageRepository.findByReceiverIdAndIsReadFalse(userId).size();
    }
}