package com.technext.crm.service;

import com.technext.crm.model.Attendance;
import com.technext.crm.model.User;
import com.technext.crm.repository.AttendanceRepository;
import com.technext.crm.repository.HolidayRepository;
import com.technext.crm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceSchedulerService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HolidayRepository holidayRepository;

    // ✅ Runs every weekday at 11:59 PM
    // Auto-marks absent for employees who didn't check in
    @Scheduled(cron = "0 59 23 * * MON-FRI")
    public void autoMarkAbsentees() {
        LocalDate today = LocalDate.now();

        // Skip if today is a government/festival holiday
        boolean isHoliday = holidayRepository.existsByDate(today);
        if (isHoliday) {
            System.out.println("Holiday today - skipping auto-absent marking");
            return;
        }

        // Skip weekends (extra safety check)
        DayOfWeek day = today.getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            return;
        }

        // Get all active employees
        List<User> employees = userRepository.findAll();

        int markedAbsent = 0;
        int alreadyMarked = 0;

        for (User emp : employees) {
            // Skip inactive employees
            if (emp.getIsActive() != null && !emp.getIsActive()) continue;

            // Check if attendance already exists for today
            Optional<Attendance> existing = attendanceRepository
                .findByEmployeeIdAndDate(emp.getId(), today);

            if (existing.isEmpty()) {
                // No check-in record → mark as Absent
                Attendance att = new Attendance();
                att.setEmployeeId(emp.getId());
                att.setEmployeeName(emp.getName());
                att.setDate(today);
                att.setStatus("Absent");
                att.setNotes("Auto-marked absent - no check-in recorded");
                attendanceRepository.save(att);
                markedAbsent++;
            } else {
                // Already has a record (Present/On Leave/Holiday etc.)
                alreadyMarked++;
            }
        }

        System.out.println("Auto-absent job completed: " +
            markedAbsent + " marked absent, " +
            alreadyMarked + " already had records for " + today);
    }

    // ✅ Also runs at midnight to mark weekends and holidays
    @Scheduled(cron = "0 0 0 * * *")
    public void autoMarkWeekendAndHoliday() {
        LocalDate today = LocalDate.now();

        // Check if today is weekend
        DayOfWeek day = today.getDayOfWeek();
        boolean isWeekend = day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY;

        // Check if today is a holiday
        boolean isHoliday = holidayRepository.existsByDate(today);

        if (!isWeekend && !isHoliday) return;

        String status = isWeekend ? "Weekend" : "Holiday";

        List<User> employees = userRepository.findAll();

        for (User emp : employees) {
            if (emp.getIsActive() != null && !emp.getIsActive()) continue;

            Optional<Attendance> existing = attendanceRepository
                .findByEmployeeIdAndDate(emp.getId(), today);

            if (existing.isEmpty()) {
                Attendance att = new Attendance();
                att.setEmployeeId(emp.getId());
                att.setEmployeeName(emp.getName());
                att.setDate(today);
                att.setStatus(status);
                att.setNotes(isHoliday ?
                    "Government/Festival Holiday" :
                    "Weekend - no salary deduction");
                attendanceRepository.save(att);
            }
        }

        System.out.println("Auto-marked " + status + " for all employees on " + today);
    }

    // ✅ Manual trigger - Admin can run this anytime
    // Called from controller to backfill missing attendance
    public void manualMarkAbsentForDate(LocalDate date) {
        boolean isHoliday = holidayRepository.existsByDate(date);
        DayOfWeek day = date.getDayOfWeek();
        boolean isWeekend = day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY;

        if (isHoliday || isWeekend) return;

        List<User> employees = userRepository.findAll();

        for (User emp : employees) {
            if (emp.getIsActive() != null && !emp.getIsActive()) continue;

            Optional<Attendance> existing = attendanceRepository
                .findByEmployeeIdAndDate(emp.getId(), date);

            if (existing.isEmpty()) {
                Attendance att = new Attendance();
                att.setEmployeeId(emp.getId());
                att.setEmployeeName(emp.getName());
                att.setDate(date);
                att.setStatus("Absent");
                att.setNotes("Manually backfilled - no check-in recorded");
                attendanceRepository.save(att);
            }
        }
    }
}