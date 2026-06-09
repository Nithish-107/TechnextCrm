package com.technext.crm.service;

import com.technext.crm.model.Deal;
import com.technext.crm.repository.DealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class DealService {

    @Autowired
    private DealRepository dealRepository;

    public List<Deal> getAllDeals() {
        return dealRepository.findAll();
    }

    public Optional<Deal> getDealById(Integer id) {
        return dealRepository.findById(id);
    }

    public List<Deal> getDealsByStage(String stage) {
        return dealRepository.findByStage(stage);
    }

    public List<Deal> getDealsByOwner(Integer ownerId) {
        return dealRepository.findByOwnerId(ownerId);
    }

    public Deal createDeal(Deal deal) {
        return dealRepository.save(deal);
    }

    public Deal updateDeal(Integer id, Deal deal) {
        deal.setId(id);
        return dealRepository.save(deal);
    }

    public void deleteDeal(Integer id) {
        dealRepository.deleteById(id);
    }
}