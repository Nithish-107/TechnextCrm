package com.technext.crm.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "leads")
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private String company;
    private String email;
    private String phone;
    private String source;
    private String status;
    private String notes;

    @Column(name = "owner_id")
    private Integer ownerId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}