package com.technext.crm.controller;

import com.technext.crm.model.Interview;
import com.technext.crm.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = "http://localhost:3000")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @GetMapping
    public List<Interview> getAllInterviews() {
        return interviewService.getAllInterviews();
    }

    @GetMapping("/candidate/{candidateId}")
    public List<Interview> getByCandidate(@PathVariable Integer candidateId) {
        return interviewService.getByCandidate(candidateId);
    }

    @GetMapping("/status/{status}")
    public List<Interview> getByStatus(@PathVariable String status) {
        return interviewService.getByStatus(status);
    }

    @GetMapping("/result/{result}")
    public List<Interview> getByResult(@PathVariable String result) {
        return interviewService.getByResult(result);
    }

    @PostMapping
    public ResponseEntity<Interview> createInterview(@RequestBody Interview interview) {
        return ResponseEntity.ok(interviewService.createInterview(interview));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Interview> updateInterview(@PathVariable Integer id, @RequestBody Interview interview) {
        return ResponseEntity.ok(interviewService.updateInterview(id, interview));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInterview(@PathVariable Integer id) {
        interviewService.deleteInterview(id);
        return ResponseEntity.ok().build();
    }
}