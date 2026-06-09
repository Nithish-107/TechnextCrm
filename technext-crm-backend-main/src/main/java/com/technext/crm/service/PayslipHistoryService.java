package com.technext.crm.service;

import com.technext.crm.model.PayslipHistory;
import com.technext.crm.model.User;
import com.technext.crm.repository.PayslipHistoryRepository;
import com.technext.crm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PayslipHistoryService {

    @Autowired
    private PayslipHistoryRepository payslipHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    public List<PayslipHistory> getAllPayslips() {
        return payslipHistoryRepository.findAll();
    }

    public List<PayslipHistory> getPayslipsByEmployee(Integer employeeId) {
        return payslipHistoryRepository.findByEmployeeIdOrderByYearDescMonthDesc(employeeId);
    }

    public List<PayslipHistory> getPayslipsByMonthYear(Integer month, Integer year) {
        return payslipHistoryRepository.findByMonthAndYear(month, year);
    }

    public Optional<PayslipHistory> getPayslip(Integer employeeId, Integer month, Integer year) {
        return payslipHistoryRepository.findByEmployeeIdAndMonthAndYear(employeeId, month, year);
    }

    public PayslipHistory savePayslip(PayslipHistory payslip) {
        payslip.setGeneratedAt(LocalDateTime.now());
        // Use merge - update if exists
        Optional<PayslipHistory> existing = payslipHistoryRepository
            .findByEmployeeIdAndMonthAndYear(payslip.getEmployeeId(), payslip.getMonth(), payslip.getYear());
        if (existing.isPresent()) {
            payslip.setId(existing.get().getId());
        }
        return payslipHistoryRepository.save(payslip);
    }

    public PayslipHistory updateStatus(Integer id, String status) {
        PayslipHistory payslip = payslipHistoryRepository.findById(id).orElseThrow();
        payslip.setStatus(status);
        return payslipHistoryRepository.save(payslip);
    }

    public void deletePayslip(Integer id) {
        payslipHistoryRepository.deleteById(id);
    }

    // Auto-generate payslips on 1st of every month at 9:00 AM
    @Scheduled(cron = "0 0 9 1 * *")
    public void autoGenerateMonthlyPayslips() {
        LocalDateTime now = LocalDateTime.now();
        int month = now.getMonthValue();
        int year = now.getYear();

        List<User> users = userRepository.findAll();

        for (User user : users) {
            if (user.getBasicSalary() == null || user.getBasicSalary().compareTo(BigDecimal.ZERO) == 0) continue;

            // Skip if already generated
            Optional<PayslipHistory> existing = payslipHistoryRepository
                .findByEmployeeIdAndMonthAndYear(user.getId(), month, year);
            if (existing.isPresent()) continue;

            BigDecimal basic = user.getBasicSalary();
            BigDecimal hra = basic.multiply(new BigDecimal("0.40")).setScale(0, RoundingMode.HALF_UP);
            BigDecimal transport = new BigDecimal("2000");
            BigDecimal medical = new BigDecimal("1250");
            BigDecimal special = basic.multiply(new BigDecimal("0.15")).setScale(0, RoundingMode.HALF_UP);
            BigDecimal gross = basic.add(hra).add(transport).add(medical).add(special);
            BigDecimal pf = basic.multiply(new BigDecimal("0.12")).setScale(0, RoundingMode.HALF_UP);
            BigDecimal esi = gross.compareTo(new BigDecimal("21000")) <= 0
                ? gross.multiply(new BigDecimal("0.0075")).setScale(0, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
            BigDecimal profTax = basic.compareTo(new BigDecimal("15000")) <= 0
                ? new BigDecimal("150") : new BigDecimal("200");
            BigDecimal tds = basic.compareTo(new BigDecimal("50000")) > 0
                ? gross.multiply(new BigDecimal("0.10")).setScale(0, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
            BigDecimal totalDed = pf.add(esi).add(profTax).add(tds);
            BigDecimal net = gross.subtract(totalDed);

            PayslipHistory payslip = new PayslipHistory();
            payslip.setEmployeeId(user.getId());
            payslip.setEmployeeName(user.getName());
            payslip.setMonth(month);
            payslip.setYear(year);
            payslip.setBasicSalary(basic);
            payslip.setHra(hra);
            payslip.setTransport(transport);
            payslip.setMedical(medical);
            payslip.setSpecialAllowance(special);
            payslip.setBonus(BigDecimal.ZERO);
            payslip.setGrossSalary(gross);
            payslip.setPf(pf);
            payslip.setEsi(esi);
            payslip.setProfessionalTax(profTax);
            payslip.setTds(tds);
            payslip.setLopDays(0);
            payslip.setLopDeduction(BigDecimal.ZERO);
            payslip.setExtraDeduction(BigDecimal.ZERO);
            payslip.setTotalDeductions(totalDed);
            payslip.setNetSalary(net);
            payslip.setWorkingDays(26);
            payslip.setPresentDays(26);
            payslip.setStatus("Generated");
            payslip.setGeneratedBy("System Auto-Generate");
            payslip.setGeneratedAt(LocalDateTime.now());

            payslipHistoryRepository.save(payslip);
        }
        System.out.println("✅ Auto-generated payslips for " + month + "/" + year + " — " + users.size() + " employees");
    }
}