package com.technext.crm.repository;

import com.technext.crm.model.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveRepository extends JpaRepository<Leave, Integer> {
    List<Leave> findByEmployeeId(Integer employeeId);
    List<Leave> findByStatus(String status);
    List<Leave> findByEmployeeIdAndStatus(Integer employeeId, String status);
    List<Leave> findByOrderByCreatedAtDesc();
}