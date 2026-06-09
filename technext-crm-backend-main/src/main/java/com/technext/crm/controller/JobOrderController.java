package com.technext.crm.controller;

import com.technext.crm.model.JobOrder;
import com.technext.crm.service.JobOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:3000")
public class JobOrderController {

    @Autowired
    private JobOrderService jobOrderService;

    @GetMapping
    public List<JobOrder> getAllJobOrders() {
        return jobOrderService.getAllJobOrders();
    }

    @GetMapping("/{id}")
    public Optional<JobOrder> getJobOrderById(@PathVariable Integer id) {
        return jobOrderService.getJobOrderById(id);
    }

    @GetMapping("/owner/{ownerId}")
    public List<JobOrder> getJobOrdersByOwner(@PathVariable Integer ownerId) {
        return jobOrderService.getJobOrdersByOwner(ownerId);
    }

    @GetMapping("/status/{status}")
    public List<JobOrder> getJobOrdersByStatus(@PathVariable String status) {
        return jobOrderService.getJobOrdersByStatus(status);
    }

    @PostMapping
    public JobOrder createJobOrder(@RequestBody JobOrder jobOrder) {
        return jobOrderService.createJobOrder(jobOrder);
    }

    @PutMapping("/{id}")
    public JobOrder updateJobOrder(@PathVariable Integer id, @RequestBody JobOrder jobOrder) {
        return jobOrderService.updateJobOrder(id, jobOrder);
    }

    @DeleteMapping("/{id}")
    public void deleteJobOrder(@PathVariable Integer id) {
        jobOrderService.deleteJobOrder(id);
    }
}