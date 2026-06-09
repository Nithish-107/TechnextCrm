package com.technext.crm.repository;

import com.technext.crm.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CandidateRepository extends JpaRepository<Candidate, Integer> {
    List<Candidate> findByOwnerId(Integer ownerId);
    List<Candidate> findByStage(String stage);
}