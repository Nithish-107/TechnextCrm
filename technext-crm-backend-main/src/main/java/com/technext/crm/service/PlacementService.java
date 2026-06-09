package com.technext.crm.service;

import com.technext.crm.model.Placement;
import com.technext.crm.repository.PlacementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PlacementService {

    @Autowired
    private PlacementRepository placementRepository;

    public List<Placement> getAllPlacements() {
        return placementRepository.findAll();
    }

    public Optional<Placement> getPlacementById(Integer id) {
        return placementRepository.findById(id);
    }

    public List<Placement> getPlacementsByStatus(String status) {
        return placementRepository.findByStatus(status);
    }

    public List<Placement> getPlacementsByCandidate(Integer candidateId) {
        return placementRepository.findByCandidateId(candidateId);
    }

    public List<Placement> getPlacementsByOwner(Integer ownerId) {
        return placementRepository.findByOwnerId(ownerId);
    }

    public Placement createPlacement(Placement placement) {
        return placementRepository.save(placement);
    }

    public Placement updatePlacement(Integer id, Placement placement) {
        placement.setId(id);
        return placementRepository.save(placement);
    }

    public void deletePlacement(Integer id) {
        placementRepository.deleteById(id);
    }
}