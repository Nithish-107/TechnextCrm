package com.technext.crm.repository;

import com.technext.crm.model.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Integer> {
    List<Lead> findByOwnerId(Integer ownerId);
    List<Lead> findByStatus(String status);
}