package com.technext.crm.service;

import com.technext.crm.model.Interview;
import com.technext.crm.repository.InterviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class InterviewService {

    @Autowired
    private InterviewRepository interviewRepository;

    public List<Interview> getAllInterviews() {
        return interviewRepository.findByOrderByInterviewDateAscInterviewTimeAsc();
    }

    public List<Interview> getByCandidate(Integer candidateId) {
        return interviewRepository.findByCandidateId(candidateId);
    }

    public List<Interview> getByStatus(String status) {
        return interviewRepository.findByStatus(status);
    }

    public List<Interview> getByResult(String result) {
        return interviewRepository.findByResult(result);
    }

    public Interview createInterview(Interview interview) {
        interview.setCreatedAt(LocalDateTime.now());
        if (interview.getStatus() == null) interview.setStatus("Scheduled");
        if (interview.getResult() == null) interview.setResult("Pending");
        return interviewRepository.save(interview);
    }

    public Interview updateInterview(Integer id, Interview interview) {
        Interview existing = interviewRepository.findById(id).orElseThrow();
        existing.setCandidateName(interview.getCandidateName());
        existing.setCandidateId(interview.getCandidateId());
        existing.setJobTitle(interview.getJobTitle());
        existing.setJobId(interview.getJobId());
        existing.setClientCompany(interview.getClientCompany());
        existing.setInterviewer(interview.getInterviewer());
        existing.setInterviewDate(interview.getInterviewDate());
        existing.setInterviewTime(interview.getInterviewTime());
        existing.setInterviewType(interview.getInterviewType());
        existing.setRound(interview.getRound());
        existing.setStatus(interview.getStatus());
        existing.setFeedback(interview.getFeedback());
        existing.setResult(interview.getResult());
        existing.setLocation(interview.getLocation());
        existing.setMeetingLink(interview.getMeetingLink());
        existing.setNotes(interview.getNotes());
        return interviewRepository.save(existing);
    }

    public void deleteInterview(Integer id) {
        interviewRepository.deleteById(id);
    }
}