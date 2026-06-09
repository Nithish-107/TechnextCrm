package com.technext.crm.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@Entity
@Table(name = "meetings")
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "meeting_date")
    private LocalDate meetingDate;


    @JsonFormat(pattern = "HH:mm:ss")
    @Column(name = "meeting_time")
    private LocalTime meetingTime;
    
    @Column(name = "participants")
    private String participants;

    private String duration;
    private String location;
    private String agenda;
    private String status;

    @Column(name = "owner_id")
    private Integer ownerId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}