package com.technext.crm.repository;

import com.technext.crm.model.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Integer> {
    Optional<LeaveBalance> findByEmployeeId(Integer employeeId);
    Optional<LeaveBalance> findByEmployeeIdAndYear(Integer employeeId, Integer year);
}