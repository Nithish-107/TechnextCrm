package com.technext.crm.service;

import com.technext.crm.model.Attendance;
import com.technext.crm.model.Holiday;
import com.technext.crm.repository.AttendanceRepository;
import com.technext.crm.repository.HolidayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private HolidayRepository holidayRepository;

    public List<Attendance> getAttendanceByEmployee(Integer employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId);
    }

    public List<Attendance> getAttendanceByEmployeeAndMonth(
            Integer employeeId, int month, int year) {
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());
        return attendanceRepository.findByEmployeeIdAndDateBetween(
            employeeId, from, to);
    }

    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    public Attendance checkIn(Integer employeeId, String employeeName) {
        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepository
            .findByEmployeeIdAndDate(employeeId, today);

        if (existing.isPresent()) return existing.get();

        // Check if holiday or weekend
        String status = "Present";
        boolean isHoliday = holidayRepository.existsByDate(today);
        boolean isWeekend = today.getDayOfWeek() == DayOfWeek.SATURDAY ||
                           today.getDayOfWeek() == DayOfWeek.SUNDAY;

        if (isHoliday) status = "Holiday";
        else if (isWeekend) status = "Weekend";

        Attendance attendance = new Attendance();
        attendance.setEmployeeId(employeeId);
        attendance.setEmployeeName(employeeName);
        attendance.setDate(today);
        attendance.setCheckIn(LocalTime.now());
        attendance.setStatus(status);
        return attendanceRepository.save(attendance);
    }

    public Attendance checkOut(Integer employeeId) {
        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepository
            .findByEmployeeIdAndDate(employeeId, today);

        if (existing.isEmpty()) return null;

        Attendance attendance = existing.get();
        attendance.setCheckOut(LocalTime.now());

        // Calculate work hours
        if (attendance.getCheckIn() != null) {
            long minutes = java.time.Duration.between(
                attendance.getCheckIn(), LocalTime.now()).toMinutes();
            attendance.setWorkHours(Math.round(minutes / 60.0 * 100.0) / 100.0);
            if (attendance.getWorkHours() < 4.0) {
                attendance.setStatus("Half Day");
            }
        }
        return attendanceRepository.save(attendance);
    }

    public Attendance markAttendance(Attendance attendance) {
        Optional<Attendance> existing = attendanceRepository
            .findByEmployeeIdAndDate(
                attendance.getEmployeeId(), attendance.getDate());
        if (existing.isPresent()) {
            attendance.setId(existing.get().getId());
        }
        return attendanceRepository.save(attendance);
    }

    public AttendanceSummary getMonthSummary(
            Integer employeeId, int month, int year) {
        List<Attendance> records = getAttendanceByEmployeeAndMonth(
            employeeId, month, year);

        int present = (int) records.stream()
            .filter(a -> a.getStatus().equals("Present")).count();
        int absent = (int) records.stream()
            .filter(a -> a.getStatus().equals("Absent")).count();
        int halfDay = (int) records.stream()
            .filter(a -> a.getStatus().equals("Half Day")).count();
        int onLeave = (int) records.stream()
            .filter(a -> a.getStatus().equals("On Leave")).count();
        int holidays = (int) records.stream()
            .filter(a -> a.getStatus().equals("Holiday")).count();
        int weekends = (int) records.stream()
            .filter(a -> a.getStatus().equals("Weekend")).count();

        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());

        // Count working days (exclude weekends and holidays)
        int workingDays = 0;
        LocalDate d = from;
        while (!d.isAfter(to)) {
            boolean isWeekend = d.getDayOfWeek() == DayOfWeek.SATURDAY ||
                               d.getDayOfWeek() == DayOfWeek.SUNDAY;
            boolean isHoliday = holidayRepository.existsByDate(d);
            if (!isWeekend && !isHoliday) workingDays++;
            d = d.plusDays(1);
        }

        int lopDays = absent + (halfDay / 2);

        AttendanceSummary summary = new AttendanceSummary();
        summary.setPresent(present);
        summary.setAbsent(absent);
        summary.setHalfDay(halfDay);
        summary.setOnLeave(onLeave);
        summary.setHolidays(holidays);
        summary.setWeekends(weekends);
        summary.setWorkingDays(workingDays);
        summary.setLopDays(lopDays);
        summary.setPaidDays(workingDays - lopDays);
        return summary;
    }

    public static class AttendanceSummary {
        private int present, absent, halfDay, onLeave;
        private int holidays, weekends, workingDays, lopDays, paidDays;

        public int getPresent() { return present; }
        public void setPresent(int v) { present = v; }
        public int getAbsent() { return absent; }
        public void setAbsent(int v) { absent = v; }
        public int getHalfDay() { return halfDay; }
        public void setHalfDay(int v) { halfDay = v; }
        public int getOnLeave() { return onLeave; }
        public void setOnLeave(int v) { onLeave = v; }
        public int getHolidays() { return holidays; }
        public void setHolidays(int v) { holidays = v; }
        public int getWeekends() { return weekends; }
        public void setWeekends(int v) { weekends = v; }
        public int getWorkingDays() { return workingDays; }
        public void setWorkingDays(int v) { workingDays = v; }
        public int getLopDays() { return lopDays; }
        public void setLopDays(int v) { lopDays = v; }
        public int getPaidDays() { return paidDays; }
        public void setPaidDays(int v) { paidDays = v; }
    }
}