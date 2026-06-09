package com.technext.crm.controller;

import com.technext.crm.model.Candidate;
import com.technext.crm.service.CandidateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins = "http://localhost:3000")
public class CandidateController {

    @Autowired
    private CandidateService candidateService;

    @GetMapping
    public List<Candidate> getAllCandidates() {
        return candidateService.getAllCandidates();
    }

    @GetMapping("/{id}")
    public Optional<Candidate> getCandidateById(@PathVariable Integer id) {
        return candidateService.getCandidateById(id);
    }

    @GetMapping("/owner/{ownerId}")
    public List<Candidate> getCandidatesByOwner(@PathVariable Integer ownerId) {
        return candidateService.getCandidatesByOwner(ownerId);
    }

    @GetMapping("/stage/{stage}")
    public List<Candidate> getCandidatesByStage(@PathVariable String stage) {
        return candidateService.getCandidatesByStage(stage);
    }

    @PostMapping
    public Candidate createCandidate(@RequestBody Candidate candidate) {
        return candidateService.createCandidate(candidate);
    }

    @PutMapping("/{id}")
    public Candidate updateCandidate(@PathVariable Integer id, @RequestBody Candidate candidate) {
        return candidateService.updateCandidate(id, candidate);
    }

    @DeleteMapping("/{id}")
    public void deleteCandidate(@PathVariable Integer id) {
        candidateService.deleteCandidate(id);
    }
}