package com.technext.crm.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "leave_balance")
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "employee_id", unique = true)
    private Integer employeeId;

    @Column(name = "employee_name")
    private String employeeName;

    @Column(name = "casual_leave_total")
    private Integer casualLeaveTotal;

    @Column(name = "casual_leave_used")
    private Integer casualLeaveUsed;

    @Column(name = "sick_leave_total")
    private Integer sickLeaveTotal;

    @Column(name = "sick_leave_used")
    private Integer sickLeaveUsed;

    @Column(name = "annual_leave_total")
    private Integer annualLeaveTotal;

    @Column(name = "annual_leave_used")
    private Integer annualLeaveUsed;

    private Integer year;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}