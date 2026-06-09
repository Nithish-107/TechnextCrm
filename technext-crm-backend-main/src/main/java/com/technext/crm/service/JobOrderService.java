package com.technext.crm.service;

import com.technext.crm.model.JobOrder;
import com.technext.crm.repository.JobOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class JobOrderService {

    @Autowired
    private JobOrderRepository jobOrderRepository;

    public List<JobOrder> getAllJobOrders() {
        return jobOrderRepository.findAll();
    }

    public Optional<JobOrder> getJobOrderById(Integer id) {
        return jobOrderRepository.findById(id);
    }

    public List<JobOrder> getJobOrdersByOwner(Integer ownerId) {
        return jobOrderRepository.findByOwnerId(ownerId);
    }

    public List<JobOrder> getJobOrdersByStatus(String status) {
        return jobOrderRepository.findByStatus(status);
    }

    public JobOrder createJobOrder(JobOrder jobOrder) {
        return jobOrderRepository.save(jobOrder);
    }

    public JobOrder updateJobOrder(Integer id, JobOrder jobOrder) {
        jobOrder.setId(id);
        return jobOrderRepository.save(jobOrder);
    }

    public void deleteJobOrder(Integer id) {
        jobOrderRepository.deleteById(id);
    }
}