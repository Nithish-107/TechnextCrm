package com.technext.crm.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "interviews")
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "candidate_id")
    private Integer candidateId;

    @Column(name = "candidate_name")
    private String candidateName;

    @Column(name = "job_id")
    private Integer jobId;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "client_company")
    private String clientCompany;

    private String interviewer;

    @Column(name = "interview_date")
    private LocalDate interviewDate;

    @Column(name = "interview_time")
    private String interviewTime;

    @Column(name = "interview_type")
    private String interviewType;

    private String round;
    private String status;
    private String feedback;
    private String result;
    private String location;

    @Column(name = "meeting_link")
    private String meetingLink;

    private String notes;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}