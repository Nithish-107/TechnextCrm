package com.technext.crm.controller;

import com.technext.crm.model.Deal;
import com.technext.crm.service.DealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/deals")
@CrossOrigin(origins = "http://localhost:3000")
public class DealController {

    @Autowired
    private DealService dealService;

    @GetMapping
    public List<Deal> getAllDeals() {
        return dealService.getAllDeals();
    }

    @GetMapping("/{id}")
    public Optional<Deal> getDealById(@PathVariable Integer id) {
        return dealService.getDealById(id);
    }

    @GetMapping("/stage/{stage}")
    public List<Deal> getDealsByStage(@PathVariable String stage) {
        return dealService.getDealsByStage(stage);
    }

    @GetMapping("/owner/{ownerId}")
    public List<Deal> getDealsByOwner(@PathVariable Integer ownerId) {
        return dealService.getDealsByOwner(ownerId);
    }

    @PostMapping
    public Deal createDeal(@RequestBody Deal deal) {
        return dealService.createDeal(deal);
    }

    @PutMapping("/{id}")
    public Deal updateDeal(@PathVariable Integer id, @RequestBody Deal deal) {
        return dealService.updateDeal(id, deal);
    }

    @DeleteMapping("/{id}")
    public void deleteDeal(@PathVariable Integer id) {
        dealService.deleteDeal(id);
    }
}