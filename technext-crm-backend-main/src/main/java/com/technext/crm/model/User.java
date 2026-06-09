package com.technext.crm.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private String email;
    private String password;
    private String role;

    @Column(name = "basic_salary")
    private BigDecimal basicSalary;

    private String department;

    @Column(name = "employee_id")
    private String employeeId;

    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @Column(name = "profile_picture", columnDefinition = "LONGTEXT")
    private String profilePicture;

    private String phone;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "work_location")
    private String workLocation;

    @Column(name = "pan_number")
    private String panNumber;

    @Column(name = "bank_account")
    private String bankAccount;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "ifsc_code")
    private String ifscCode;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}