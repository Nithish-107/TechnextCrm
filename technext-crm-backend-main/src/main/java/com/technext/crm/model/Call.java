package com.technext.crm.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "calls")
public class Call {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "contact_name")
    private String contactName;

    private String company;
    private String type;
    private String duration;

    @Column(name = "call_date")
    private LocalDateTime callDate;

    private String notes;
     
    @Column(name = "participants")
    private String participants;
    
    @Column(name = "owner_id")
    private Integer ownerId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}