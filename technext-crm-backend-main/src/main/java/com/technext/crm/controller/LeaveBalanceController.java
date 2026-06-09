package com.technext.crm.controller;

import com.technext.crm.model.LeaveBalance;
import com.technext.crm.service.LeaveBalanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leave-balance")
@CrossOrigin(origins = "http://localhost:3000")
public class LeaveBalanceController {

    @Autowired
    private LeaveBalanceService leaveBalanceService;

    @GetMapping
    public List<LeaveBalance> getAllBalances() {
        return leaveBalanceService.getAllBalances();
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<LeaveBalance> getByEmployee(
            @PathVariable Integer employeeId) {
        LeaveBalance balance = leaveBalanceService.getByEmployee(employeeId);
        return balance != null ?
            ResponseEntity.ok(balance) :
            ResponseEntity.notFound().build();
    }

    @GetMapping("/{employeeId}/year/{year}")
    public ResponseEntity<LeaveBalance> getByEmployeeAndYear(
            @PathVariable Integer employeeId,
            @PathVariable Integer year) {
        LeaveBalance balance = leaveBalanceService
            .getByEmployeeAndYear(employeeId, year);
        return balance != null ?
            ResponseEntity.ok(balance) :
            ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<LeaveBalance> saveBalance(
            @RequestBody LeaveBalance balance) {
        return ResponseEntity.ok(leaveBalanceService.saveBalance(balance));
    }

    @PostMapping("/initialize")
    public ResponseEntity<LeaveBalance> initialize(
            @RequestBody Map<String, Object> body) {
        Integer employeeId = Integer.valueOf(body.get("employeeId").toString());
        String employeeName = (String) body.get("employeeName");
        return ResponseEntity.ok(
            leaveBalanceService.initializeForEmployee(employeeId, employeeName));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LeaveBalance> updateBalance(
            @PathVariable Integer id,
            @RequestBody LeaveBalance balance) {
        return ResponseEntity.ok(
            leaveBalanceService.updateBalance(id, balance));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBalance(@PathVariable Integer id) {
        leaveBalanceService.deleteBalance(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/remaining/casual/{employeeId}")
    public ResponseEntity<Map<String, Integer>> getRemainingCasual(
            @PathVariable Integer employeeId) {
        return ResponseEntity.ok(Map.of("remaining",
            leaveBalanceService.getRemainingCasualLeave(employeeId)));
    }

    @GetMapping("/remaining/sick/{employeeId}")
    public ResponseEntity<Map<String, Integer>> getRemainingSick(
            @PathVariable Integer employeeId) {
        return ResponseEntity.ok(Map.of("remaining",
            leaveBalanceService.getRemainingSickLeave(employeeId)));
    }

    @GetMapping("/remaining/annual/{employeeId}")
    public ResponseEntity<Map<String, Integer>> getRemainingAnnual(
            @PathVariable Integer employeeId) {
        return ResponseEntity.ok(Map.of("remaining",
            leaveBalanceService.getRemainingAnnualLeave(employeeId)));
    }
}