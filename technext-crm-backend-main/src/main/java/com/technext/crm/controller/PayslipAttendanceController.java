package com.technext.crm.controller;

import com.technext.crm.service.AttendanceService;
import com.technext.crm.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

// Add this endpoint to AttendanceController.java
// GET /api/attendance/lop/{employeeId}/month/{month}/year/{year}
// Returns LOP days from attendance for payslip auto-calculation

@RestController
@RequestMapping("/api/attendance/lop")
@CrossOrigin(origins = "http://localhost:3000")
public class PayslipAttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private LeaveService leaveService;

    @GetMapping("/{employeeId}/month/{month}/year/{year}")
    public ResponseEntity<Map<String, Object>> getLopForPayslip(
            @PathVariable Integer employeeId,
            @PathVariable Integer month,
            @PathVariable Integer year) {

        // Get attendance summary
        AttendanceService.AttendanceSummary summary =
            attendanceService.getMonthSummary(employeeId, month, year);

        // Get LOP from approved leaves
        int leaveLop = leaveService.getLopDaysForMonth(employeeId, month, year);

        // Total LOP = attendance absent days + approved LOP leaves
        int totalLop = summary.getLopDays() + leaveLop;
        int workingDays = summary.getWorkingDays() > 0 ? summary.getWorkingDays() : 26;
        int presentDays = summary.getPresent() + summary.getHalfDay();

        return ResponseEntity.ok(Map.of(
            "employeeId", employeeId,
            "month", month,
            "year", year,
            "workingDays", workingDays,
            "presentDays", presentDays,
            "attendanceLop", summary.getLopDays(),
            "leaveLop", leaveLop,
            "totalLop", totalLop,
            "paidDays", workingDays - totalLop
        ));
    }
}