package com.technext.crm.repository;

import com.technext.crm.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Integer> {
    List<Interview> findByCandidateId(Integer candidateId);
    List<Interview> findByJobId(Integer jobId);
    List<Interview> findByStatus(String status);
    List<Interview> findByInterviewer(String interviewer);
    List<Interview> findByResult(String result);
    List<Interview> findByOrderByInterviewDateAscInterviewTimeAsc();
}