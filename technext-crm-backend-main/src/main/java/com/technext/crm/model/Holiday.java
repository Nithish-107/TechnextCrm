package com.technext.crm.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "holidays")
public class Holiday {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private LocalDate date;
    private String type;
    private String description;

    @Column(name = "is_restricted")
    private Boolean isRestricted;
}