package com.technext.crm.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "job_orders")
public class JobOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;

    @Column(name = "account_id")
    private Integer accountId;

    private String location;
    private String type;
    private Integer openings;
    private String priority;
    private String status;
    private String description;

    @Column(name = "owner_id")
    private Integer ownerId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}