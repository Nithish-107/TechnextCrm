package com.technext.crm.service;

import com.technext.crm.model.Attendance;
import com.technext.crm.model.Holiday;
import com.technext.crm.model.Leave;
import com.technext.crm.model.LeaveBalance;
import com.technext.crm.repository.AttendanceRepository;
import com.technext.crm.repository.HolidayRepository;
import com.technext.crm.repository.LeaveRepository;
import com.technext.crm.repository.LeaveBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LeaveService {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private HolidayRepository holidayRepository;

    public List<Leave> getAllLeaves() {
        return leaveRepository.findByOrderByCreatedAtDesc();
    }

    public List<Leave> getLeavesByEmployee(Integer employeeId) {
        return leaveRepository.findByEmployeeId(employeeId);
    }

    public List<Leave> getLeavesByStatus(String status) {
        return leaveRepository.findByStatus(status);
    }

    public Leave applyLeave(Leave leave) {
        autoInitLeaveBalance(leave.getEmployeeId(), leave.getEmployeeName());
        leave.setStatus("Pending");
        leave.setCreatedAt(LocalDateTime.now());
        return leaveRepository.save(leave);
    }

    public Leave approveLeave(Integer id, String approvedBy) {
        Leave leave = leaveRepository.findById(id).orElseThrow();
        leave.setStatus("Approved");
        leave.setApprovedBy(approvedBy);
        leave.setApprovedAt(LocalDateTime.now());

        // Deduct from leave balance for paid leaves
        if (!leave.getLeaveType().equals("Loss of Pay")) {
            Optional<LeaveBalance> balanceOpt = leaveBalanceRepository
                .findByEmployeeId(leave.getEmployeeId());
            if (balanceOpt.isPresent()) {
                LeaveBalance balance = balanceOpt.get();
                switch (leave.getLeaveType()) {
                    case "Casual Leave":
                        balance.setCasualLeaveUsed(
                            balance.getCasualLeaveUsed() + leave.getDays());
                        break;
                    case "Sick Leave":
                        balance.setSickLeaveUsed(
                            balance.getSickLeaveUsed() + leave.getDays());
                        break;
                    case "Annual Leave":
                        balance.setAnnualLeaveUsed(
                            balance.getAnnualLeaveUsed() + leave.getDays());
                        break;
                    case "Maternity Leave":
                    case "Paternity Leave":
                        // No balance deduction for maternity/paternity
                        break;
                }
                leaveBalanceRepository.save(balance);
            }
        }

        // AUTO-MARK ATTENDANCE for all leave days
        autoMarkAttendanceForLeave(leave);

        return leaveRepository.save(leave);
    }

    public Leave rejectLeave(Integer id, String rejectedBy) {
        Leave leave = leaveRepository.findById(id).orElseThrow();
        leave.setStatus("Rejected");
        leave.setApprovedBy(rejectedBy);
        leave.setApprovedAt(LocalDateTime.now());
        return leaveRepository.save(leave);
    }

    public Leave cancelLeave(Integer id) {
        Leave leave = leaveRepository.findById(id).orElseThrow();

        // Restore leave balance if was approved paid leave
        if ("Approved".equals(leave.getStatus()) &&
            !leave.getLeaveType().equals("Loss of Pay")) {
            Optional<LeaveBalance> balanceOpt = leaveBalanceRepository
                .findByEmployeeId(leave.getEmployeeId());
            if (balanceOpt.isPresent()) {
                LeaveBalance balance = balanceOpt.get();
                switch (leave.getLeaveType()) {
                    case "Casual Leave":
                        balance.setCasualLeaveUsed(
                            Math.max(0, balance.getCasualLeaveUsed() - leave.getDays()));
                        break;
                    case "Sick Leave":
                        balance.setSickLeaveUsed(
                            Math.max(0, balance.getSickLeaveUsed() - leave.getDays()));
                        break;
                    case "Annual Leave":
                        balance.setAnnualLeaveUsed(
                            Math.max(0, balance.getAnnualLeaveUsed() - leave.getDays()));
                        break;
                }
                leaveBalanceRepository.save(balance);
            }
        }

        // Remove attendance records for those leave days
        if ("Approved".equals(leave.getStatus())) {
            clearAttendanceForLeave(leave);
        }

        leave.setStatus("Cancelled");
        return leaveRepository.save(leave);
    }

    // =====================================================
    // AUTO-MARK ATTENDANCE when leave is approved
    // Key logic:
    // - Paid leave (CL/SL/AL) → mark as "On Leave" → NO salary cut
    // - Loss of Pay → mark as "Absent" → SALARY WILL BE CUT
    // - Weekends → skip (mark as "Weekend")
    // - Government/Festival holidays → skip (mark as "Holiday")
    // =====================================================
    private void autoMarkAttendanceForLeave(Leave leave) {
        if (leave.getFromDate() == null || leave.getToDate() == null) return;

        String attendanceStatus;
        if ("Loss of Pay".equals(leave.getLeaveType())) {
            attendanceStatus = "Absent"; // Will be counted as LOP → salary cut
        } else {
            attendanceStatus = "On Leave"; // Paid leave → no salary cut
        }

        LocalDate current = leave.getFromDate();
        LocalDate end = leave.getToDate();

        while (!current.isAfter(end)) {
            // Skip weekends
            boolean isWeekend = current.getDayOfWeek() == DayOfWeek.SATURDAY ||
                               current.getDayOfWeek() == DayOfWeek.SUNDAY;

            // Skip government/festival holidays
            boolean isHoliday = holidayRepository.existsByDate(current);

            if (!isWeekend && !isHoliday) {
                // Check if attendance already exists for this day
                Optional<Attendance> existing = attendanceRepository
                    .findByEmployeeIdAndDate(leave.getEmployeeId(), current);

                Attendance att;
                if (existing.isPresent()) {
                    att = existing.get();
                } else {
                    att = new Attendance();
                    att.setEmployeeId(leave.getEmployeeId());
                    att.setEmployeeName(leave.getEmployeeName());
                    att.setDate(current);
                }

                att.setStatus(attendanceStatus);
                att.setNotes(leave.getLeaveType() + " (Leave ID: " + leave.getId() + ")");
                attendanceRepository.save(att);
            }

            current = current.plusDays(1);
        }
    }

    // Clear attendance records when leave is cancelled
    private void clearAttendanceForLeave(Leave leave) {
        if (leave.getFromDate() == null || leave.getToDate() == null) return;

        LocalDate current = leave.getFromDate();
        LocalDate end = leave.getToDate();

        while (!current.isAfter(end)) {
            Optional<Attendance> existing = attendanceRepository
                .findByEmployeeIdAndDate(leave.getEmployeeId(), current);

            if (existing.isPresent()) {
                Attendance att = existing.get();
                // Only clear if it was marked by this leave
                if (att.getNotes() != null &&
                    att.getNotes().contains("Leave ID: " + leave.getId())) {
                    attendanceRepository.delete(att);
                }
            }
            current = current.plusDays(1);
        }
    }

    // Auto-initialize leave balance when not exists
    public LeaveBalance autoInitLeaveBalance(Integer employeeId, String employeeName) {
        Optional<LeaveBalance> existing = leaveBalanceRepository.findByEmployeeId(employeeId);
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
        balance.setYear(LocalDate.now().getYear());
        return leaveBalanceRepository.save(balance);
    }

    public LeaveBalance getLeaveBalance(Integer employeeId) {
        return leaveBalanceRepository.findByEmployeeId(employeeId).orElse(null);
    }

    public LeaveBalance initializeLeaveBalance(Integer employeeId, String employeeName) {
        return autoInitLeaveBalance(employeeId, employeeName);
    }

    // Count LOP days from approved Loss of Pay leaves for a month
    public int getLopDaysForMonth(Integer employeeId, int month, int year) {
        List<Leave> leaves = leaveRepository.findByEmployeeId(employeeId);
        return (int) leaves.stream()
            .filter(l -> "Approved".equals(l.getStatus()))
            .filter(l -> "Loss of Pay".equals(l.getLeaveType()))
            .filter(l -> {
                int m = l.getFromDate().getMonthValue();
                int y = l.getFromDate().getYear();
                return m == month && y == year;
            })
            .mapToLong(Leave::getDays)
            .sum();
    }

    // Count total absence days (LOP leaves) for payslip
    public int getTotalAbsenceDaysForMonth(Integer employeeId, int month, int year) {
        return getLopDaysForMonth(employeeId, month, year);
    }
}