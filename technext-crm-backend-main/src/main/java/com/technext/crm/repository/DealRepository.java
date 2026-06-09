package com.technext.crm.repository;

import com.technext.crm.model.Deal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DealRepository extends JpaRepository<Deal, Integer> {
    List<Deal> findByStage(String stage);
    List<Deal> findByOwnerId(Integer ownerId);
}