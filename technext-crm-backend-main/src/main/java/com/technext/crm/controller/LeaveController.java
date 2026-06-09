package com.technext.crm.controller;

import com.technext.crm.model.Leave;
import com.technext.crm.model.LeaveBalance;
import com.technext.crm.service.LeaveService;
import com.technext.crm.service.LeaveBalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "http://localhost:3000")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private LeaveBalanceService leaveBalanceService;

    @GetMapping
    public List<Leave> getAllLeaves() {
        return leaveService.getAllLeaves();
    }

    @GetMapping("/employee/{employeeId}")
    public List<Leave> getByEmployee(@PathVariable Integer employeeId) {
        return leaveService.getLeavesByEmployee(employeeId);
    }

    @GetMapping("/status/{status}")
    public List<Leave> getByStatus(@PathVariable String status) {
        return leaveService.getLeavesByStatus(status);
    }

    @PostMapping
    public ResponseEntity<Leave> applyLeave(@RequestBody Leave leave) {
        return ResponseEntity.ok(leaveService.applyLeave(leave));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Leave> approveLeave(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
            leaveService.approveLeave(id, body.get("approvedBy")));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Leave> rejectLeave(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
            leaveService.rejectLeave(id, body.get("rejectedBy")));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Leave> cancelLeave(@PathVariable Integer id) {
        return ResponseEntity.ok(leaveService.cancelLeave(id));
    }

    @GetMapping("/balance/{employeeId}")
    public ResponseEntity<LeaveBalance> getBalance(
            @PathVariable Integer employeeId) {
        LeaveBalance balance = leaveBalanceService.getByEmployee(employeeId);
        return balance != null ?
            ResponseEntity.ok(balance) :
            ResponseEntity.notFound().build();
    }

    @GetMapping("/balance/all")
    public List<LeaveBalance> getAllBalances() {
        return leaveBalanceService.getAllBalances();
    }

    @PostMapping("/balance/initialize/{employeeId}")
    public ResponseEntity<LeaveBalance> initializeBalance(
            @PathVariable Integer employeeId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
            leaveBalanceService.initializeForEmployee(
                employeeId, body.get("employeeName")));
    }

    @PutMapping("/balance/{id}")
    public ResponseEntity<LeaveBalance> updateBalance(
            @PathVariable Integer id,
            @RequestBody LeaveBalance balance) {
        return ResponseEntity.ok(
            leaveBalanceService.updateBalance(id, balance));
    }

    @GetMapping("/lop/{employeeId}/{month}/{year}")
    public ResponseEntity<Map<String, Integer>> getLopDays(
            @PathVariable Integer employeeId,
            @PathVariable Integer month,
            @PathVariable Integer year) {
        int lop = leaveService.getLopDaysForMonth(employeeId, month, year);
        return ResponseEntity.ok(Map.of("lopDays", lop));
    }
}