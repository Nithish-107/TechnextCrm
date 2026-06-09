package com.technext.crm.repository;

import com.technext.crm.model.Placement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlacementRepository extends JpaRepository<Placement, Integer> {
    List<Placement> findByStatus(String status);
    List<Placement> findByCandidateId(Integer candidateId);
    List<Placement> findByOwnerId(Integer ownerId);
}