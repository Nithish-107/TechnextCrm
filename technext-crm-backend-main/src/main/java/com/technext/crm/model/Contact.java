package com.technext.crm.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "contacts")
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private String title;
    private String company;
    private String email;
    private String phone;
    private String type;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}