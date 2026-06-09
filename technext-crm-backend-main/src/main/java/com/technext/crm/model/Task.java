package com.technext.crm.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;

    @Column(name = "due_date")
    private LocalDate dueDate;

    private String priority;
    private String status;

    @Column(name = "assigned_to")
    private Integer assignedTo;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}