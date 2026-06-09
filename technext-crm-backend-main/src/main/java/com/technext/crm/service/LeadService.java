package com.technext.crm.service;

import com.technext.crm.model.Lead;
import com.technext.crm.repository.LeadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class LeadService {

    @Autowired
    private LeadRepository leadRepository;

    public List<Lead> getAllLeads() {
        return leadRepository.findAll();
    }

    public Optional<Lead> getLeadById(Integer id) {
        return leadRepository.findById(id);
    }

    public List<Lead> getLeadsByOwner(Integer ownerId) {
        return leadRepository.findByOwnerId(ownerId);
    }

    public List<Lead> getLeadsByStatus(String status) {
        return leadRepository.findByStatus(status);
    }

    public Lead createLead(Lead lead) {
        return leadRepository.save(lead);
    }

    public Lead updateLead(Integer id, Lead lead) {
        lead.setId(id);
        return leadRepository.save(lead);
    }

    public void deleteLead(Integer id) {
        leadRepository.deleteById(id);
    }
}