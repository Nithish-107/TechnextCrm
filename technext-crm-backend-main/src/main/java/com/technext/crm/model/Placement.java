package com.technext.crm.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "placements")
public class Placement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "candidate_name")
    private String candidateName;

    @Column(name = "candidate_id")
    private Integer candidateId;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "client_company")
    private String clientCompany;

    @Column(name = "start_date")
    private LocalDate startDate;

    private BigDecimal salary;
    private BigDecimal commission;
    private String status;
    private String notes;

    @Column(name = "owner_id")
    private Integer ownerId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}