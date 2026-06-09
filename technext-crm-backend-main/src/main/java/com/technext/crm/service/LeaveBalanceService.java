package com.technext.crm.service;

import com.technext.crm.model.LeaveBalance;
import com.technext.crm.repository.LeaveBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class LeaveBalanceService {

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    public List<LeaveBalance> getAllBalances() {
        return leaveBalanceRepository.findAll();
    }

    public LeaveBalance getByEmployee(Integer employeeId) {
        return leaveBalanceRepository.findByEmployeeId(employeeId).orElse(null);
    }

    public LeaveBalance getByEmployeeAndYear(Integer employeeId, Integer year) {
        return leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, year).orElse(null);
    }

    public LeaveBalance saveBalance(LeaveBalance balance) {
        Optional<LeaveBalance> existing = leaveBalanceRepository
            .findByEmployeeId(balance.getEmployeeId());
        if (existing.isPresent()) {
            balance.setId(existing.get().getId());
        }
        return leaveBalanceRepository.save(balance);
    }

    public LeaveBalance updateBalance(Integer id, LeaveBalance balance) {
        balance.setId(id);
        return leaveBalanceRepository.save(balance);
    }

    public LeaveBalance initializeForEmployee(
            Integer employeeId, String employeeName) {
        Optional<LeaveBalance> existing = leaveBalanceRepository
            .findByEmployeeId(employeeId);
        if (existing.isPresent()) return existing.get();

        LeaveBalance balance = new LeaveBalance();
        balance.setEmployeeId(employeeId);
        balance.setEmployeeName(employeeName);
        balance.setCasualLeaveTotal(12);
        balance.setCasualLeaveUsed(0);
        balance.setSickLeaveTotal(12);
        balance.setSickLeaveUsed(0);
        balance.setAnnualLeaveTotal(15);
        balance.setAnnualLeaveUsed(0);
        balance.setYear(2026);
        return leaveBalanceRepository.save(balance);
    }

    public void deleteBalance(Integer id) {
        leaveBalanceRepository.deleteById(id);
    }

    public int getRemainingCasualLeave(Integer employeeId) {
        LeaveBalance b = getByEmployee(employeeId);
        if (b == null) return 12;
        return b.getCasualLeaveTotal() - b.getCasualLeaveUsed();
    }

    public int getRemainingSickLeave(Integer employeeId) {
        LeaveBalance b = getByEmployee(employeeId);
        if (b == null) return 12;
        return b.getSickLeaveTotal() - b.getSickLeaveUsed();
    }

    public int getRemainingAnnualLeave(Integer employeeId) {
        LeaveBalance b = getByEmployee(employeeId);
        if (b == null) return 15;
        return b.getAnnualLeaveTotal() - b.getAnnualLeaveUsed();
    }
}