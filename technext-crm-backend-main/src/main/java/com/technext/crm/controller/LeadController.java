package com.technext.crm.controller;

import com.technext.crm.model.Lead;
import com.technext.crm.service.LeadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/leads")
@CrossOrigin(origins = "http://localhost:3000")
public class LeadController {

    @Autowired
    private LeadService leadService;

    @GetMapping
    public List<Lead> getAllLeads() {
        return leadService.getAllLeads();
    }

    @GetMapping("/{id}")
    public Optional<Lead> getLeadById(@PathVariable Integer id) {
        return leadService.getLeadById(id);
    }

    @GetMapping("/owner/{ownerId}")
    public List<Lead> getLeadsByOwner(@PathVariable Integer ownerId) {
        return leadService.getLeadsByOwner(ownerId);
    }

    @GetMapping("/status/{status}")
    public List<Lead> getLeadsByStatus(@PathVariable String status) {
        return leadService.getLeadsByStatus(status);
    }

    @PostMapping
    public Lead createLead(@RequestBody Lead lead) {
        return leadService.createLead(lead);
    }

    @PutMapping("/{id}")
    public Lead updateLead(@PathVariable Integer id, @RequestBody Lead lead) {
        return leadService.updateLead(id, lead);
    }

    @DeleteMapping("/{id}")
    public void deleteLead(@PathVariable Integer id) {
        leadService.deleteLead(id);
    }
}