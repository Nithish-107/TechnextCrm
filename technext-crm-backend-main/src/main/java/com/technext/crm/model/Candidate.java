package com.technext.crm.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "candidates")
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    @Column(name = "current_role")
    private String currentRole;

    private String email;
    private String phone;
    private String skills;
    private String experience;
    private String location;
    private String stage;

    @Column(name = "owner_id")
    private Integer ownerId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}