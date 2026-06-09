package com.technext.crm.controller;

import com.technext.crm.model.PayslipHistory;
import com.technext.crm.service.PayslipHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payslips")
@CrossOrigin(origins = "http://localhost:3000")
public class PayslipHistoryController {

    @Autowired
    private PayslipHistoryService payslipHistoryService;

    @GetMapping
    public List<PayslipHistory> getAllPayslips() {
        return payslipHistoryService.getAllPayslips();
    }

    @GetMapping("/employee/{employeeId}")
    public List<PayslipHistory> getByEmployee(@PathVariable Integer employeeId) {
        return payslipHistoryService.getPayslipsByEmployee(employeeId);
    }

    @GetMapping("/month/{month}/year/{year}")
    public List<PayslipHistory> getByMonthYear(
            @PathVariable Integer month,
            @PathVariable Integer year) {
        return payslipHistoryService.getPayslipsByMonthYear(month, year);
    }

    @GetMapping("/employee/{employeeId}/month/{month}/year/{year}")
    public ResponseEntity<?> getSpecific(
            @PathVariable Integer employeeId,
            @PathVariable Integer month,
            @PathVariable Integer year) {
        Optional<PayslipHistory> payslip = payslipHistoryService.getPayslip(employeeId, month, year);
        return payslip.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PayslipHistory> savePayslip(@RequestBody PayslipHistory payslip) {
        PayslipHistory saved = payslipHistoryService.savePayslip(payslip);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PayslipHistory> updateStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        PayslipHistory updated = payslipHistoryService.updateStatus(id, body.get("status"));
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayslip(@PathVariable Integer id) {
        payslipHistoryService.deletePayslip(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/auto-generate")
    public ResponseEntity<String> triggerAutoGenerate() {
        payslipHistoryService.autoGenerateMonthlyPayslips();
        return ResponseEntity.ok("Payslips generated successfully!");
    }
}