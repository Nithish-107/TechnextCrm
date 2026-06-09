package com.technext.crm.controller;

import com.technext.crm.model.Placement;
import com.technext.crm.service.PlacementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/placements")
@CrossOrigin(origins = "http://localhost:3000")
public class PlacementController {

    @Autowired
    private PlacementService placementService;

    @GetMapping
    public List<Placement> getAllPlacements() {
        return placementService.getAllPlacements();
    }

    @GetMapping("/{id}")
    public Optional<Placement> getPlacementById(@PathVariable Integer id) {
        return placementService.getPlacementById(id);
    }

    @GetMapping("/status/{status}")
    public List<Placement> getPlacementsByStatus(@PathVariable String status) {
        return placementService.getPlacementsByStatus(status);
    }

    @GetMapping("/candidate/{candidateId}")
    public List<Placement> getPlacementsByCandidate(@PathVariable Integer candidateId) {
        return placementService.getPlacementsByCandidate(candidateId);
    }

    @GetMapping("/owner/{ownerId}")
    public List<Placement> getPlacementsByOwner(@PathVariable Integer ownerId) {
        return placementService.getPlacementsByOwner(ownerId);
    }

    @PostMapping
    public Placement createPlacement(@RequestBody Placement placement) {
        return placementService.createPlacement(placement);
    }

    @PutMapping("/{id}")
    public Placement updatePlacement(@PathVariable Integer id, @RequestBody Placement placement) {
        return placementService.updatePlacement(id, placement);
    }

    @DeleteMapping("/{id}")
    public void deletePlacement(@PathVariable Integer id) {
        placementService.deletePlacement(id);
    }
}