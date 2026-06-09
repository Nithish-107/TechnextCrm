package com.technext.crm.repository;

import com.technext.crm.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface HolidayRepository extends JpaRepository<Holiday, Integer> {
    List<Holiday> findByDateBetween(LocalDate from, LocalDate to);
    List<Holiday> findByType(String type);
    boolean existsByDate(LocalDate date);
}