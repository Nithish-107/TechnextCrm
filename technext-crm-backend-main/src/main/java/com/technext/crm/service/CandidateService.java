package com.technext.crm.service;

import com.technext.crm.model.Candidate;
import com.technext.crm.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CandidateService {

    @Autowired
    private CandidateRepository candidateRepository;

    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    public Optional<Candidate> getCandidateById(Integer id) {
        return candidateRepository.findById(id);
    }

    public List<Candidate> getCandidatesByOwner(Integer ownerId) {
        return candidateRepository.findByOwnerId(ownerId);
    }

    public List<Candidate> getCandidatesByStage(String stage) {
        return candidateRepository.findByStage(stage);
    }

    public Candidate createCandidate(Candidate candidate) {
        return candidateRepository.save(candidate);
    }

    public Candidate updateCandidate(Integer id, Candidate candidate) {
        candidate.setId(id);
        return candidateRepository.save(candidate);
    }

    public void deleteCandidate(Integer id) {
        candidateRepository.deleteById(id);
    }
}