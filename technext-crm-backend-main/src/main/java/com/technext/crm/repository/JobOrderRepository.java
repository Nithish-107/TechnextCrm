package com.technext.crm.repository;

import com.technext.crm.model.JobOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobOrderRepository extends JpaRepository<JobOrder, Integer> {
    List<JobOrder> findByOwnerId(Integer ownerId);
    List<JobOrder> findByStatus(String status);
}