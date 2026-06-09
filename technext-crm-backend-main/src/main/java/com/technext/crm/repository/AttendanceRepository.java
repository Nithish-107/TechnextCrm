package com.technext.crm.repository;

import com.technext.crm.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    List<Attendance> findByEmployeeId(Integer employeeId);
    List<Attendance> findByEmployeeIdAndDateBetween(Integer employeeId, LocalDate from, LocalDate to);
    List<Attendance> findByDate(LocalDate date);
    Optional<Attendance> findByEmployeeIdAndDate(Integer employeeId, LocalDate date);
    List<Attendance> findByEmployeeIdAndStatus(Integer employeeId, String status);
}