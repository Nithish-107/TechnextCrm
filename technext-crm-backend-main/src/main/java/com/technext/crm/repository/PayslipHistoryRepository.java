package com.technext.crm.repository;

import com.technext.crm.model.PayslipHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PayslipHistoryRepository extends JpaRepository<PayslipHistory, Integer> {
    List<PayslipHistory> findByEmployeeId(Integer employeeId);
    List<PayslipHistory> findByMonthAndYear(Integer month, Integer year);
    List<PayslipHistory> findByEmployeeIdOrderByYearDescMonthDesc(Integer employeeId);
    Optional<PayslipHistory> findByEmployeeIdAndMonthAndYear(Integer employeeId, Integer month, Integer year);
    List<PayslipHistory> findByStatus(String status);
}