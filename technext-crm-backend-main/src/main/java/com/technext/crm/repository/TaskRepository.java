package com.technext.crm.repository;

import com.technext.crm.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Integer> {
    List<Task> findByAssignedTo(String assignedTo);
    List<Task> findByStatus(String status);
}