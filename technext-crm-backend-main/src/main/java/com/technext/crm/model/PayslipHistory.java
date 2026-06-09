package com.technext.crm.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payslip_history")
public class PayslipHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "employee_id")
    private Integer employeeId;

    @Column(name = "employee_name")
    private String employeeName;

    private Integer month;
    private Integer year;

    @Column(name = "basic_salary")
    private BigDecimal basicSalary;

    private BigDecimal hra;
    private BigDecimal transport;
    private BigDecimal medical;

    @Column(name = "special_allowance")
    private BigDecimal specialAllowance;

    private BigDecimal bonus;

    @Column(name = "bonus_reason")
    private String bonusReason;

    @Column(name = "gross_salary")
    private BigDecimal grossSalary;

    private BigDecimal pf;
    private BigDecimal esi;

    @Column(name = "professional_tax")
    private BigDecimal professionalTax;

    private BigDecimal tds;

    @Column(name = "lop_days")
    private Integer lopDays;

    @Column(name = "lop_deduction")
    private BigDecimal lopDeduction;

    @Column(name = "extra_deduction")
    private BigDecimal extraDeduction;

    @Column(name = "extra_deduction_reason")
    private String extraDeductionReason;

    @Column(name = "total_deductions")
    private BigDecimal totalDeductions;

    @Column(name = "net_salary")
    private BigDecimal netSalary;

    @Column(name = "working_days")
    private Integer workingDays;

    @Column(name = "present_days")
    private Integer presentDays;

    private String status;

    @Column(name = "generated_by")
    private String generatedBy;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;
}