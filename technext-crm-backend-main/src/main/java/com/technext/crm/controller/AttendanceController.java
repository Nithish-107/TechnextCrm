package com.technext.crm.controller;

import com.technext.crm.model.Attendance;
import com.technext.crm.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:3000")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping("/employee/{employeeId}")
    public List<Attendance> getByEmployee(
            @PathVariable Integer employeeId) {
        return attendanceService.getAttendanceByEmployee(employeeId);
    }

    @GetMapping("/employee/{employeeId}/month/{month}/year/{year}")
    public List<Attendance> getByMonth(
            @PathVariable Integer employeeId,
            @PathVariable Integer month,
            @PathVariable Integer year) {
        return attendanceService.getAttendanceByEmployeeAndMonth(
            employeeId, month, year);
    }

    @GetMapping("/date/{date}")
    public List<Attendance> getByDate(@PathVariable String date) {
        return attendanceService.getAttendanceByDate(LocalDate.parse(date));
    }

    @PostMapping("/checkin")
    public ResponseEntity<Attendance> checkIn(
            @RequestBody Map<String, Object> body) {
        Integer employeeId = (Integer) body.get("employeeId");
        String employeeName = (String) body.get("employeeName");
        return ResponseEntity.ok(
            attendanceService.checkIn(employeeId, employeeName));
    }

    @PutMapping("/checkout/{employeeId}")
    public ResponseEntity<Attendance> checkOut(
            @PathVariable Integer employeeId) {
        Attendance a = attendanceService.checkOut(employeeId);
        return a != null ?
            ResponseEntity.ok(a) :
            ResponseEntity.notFound().build();
    }

    @PostMapping("/mark")
    public ResponseEntity<Attendance> markAttendance(
            @RequestBody Attendance attendance) {
        return ResponseEntity.ok(
            attendanceService.markAttendance(attendance));
    }

    @GetMapping("/summary/{employeeId}/month/{month}/year/{year}")
    public ResponseEntity<AttendanceService.AttendanceSummary> getSummary(
            @PathVariable Integer employeeId,
            @PathVariable Integer month,
            @PathVariable Integer year) {
        return ResponseEntity.ok(
            attendanceService.getMonthSummary(employeeId, month, year));
    }
}