package com.technext.crm.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "sender_id")
    private Integer senderId;

    @Column(name = "sender_name")
    private String senderName;

    @Column(name = "receiver_id")
    private Integer receiverId;

    @Column(name = "receiver_name")
    private String receiverName;

    private String channel;

    private String message;

    @Column(name = "message_type")
    private String messageType;

    @Column(name = "is_read")
    private Boolean isRead;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}