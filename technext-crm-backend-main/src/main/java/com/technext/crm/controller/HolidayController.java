package com.technext.crm.controller;

import com.technext.crm.model.Holiday;
import com.technext.crm.service.HolidayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/holidays")
@CrossOrigin(origins = "http://localhost:3000")
public class HolidayController {

    @Autowired
    private HolidayService holidayService;

    @GetMapping
    public List<Holiday> getAllHolidays() {
        return holidayService.getAllHolidays();
    }

    @GetMapping("/type/{type}")
    public List<Holiday> getByType(@PathVariable String type) {
        return holidayService.getHolidaysByType(type);
    }

    @GetMapping("/month/{month}/year/{year}")
    public List<Holiday> getByMonth(
            @PathVariable Integer month,
            @PathVariable Integer year) {
        return holidayService.getHolidaysByMonth(month, year);
    }

    @PostMapping
    public ResponseEntity<Holiday> addHoliday(@RequestBody Holiday holiday) {
        return ResponseEntity.ok(holidayService.addHoliday(holiday));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Holiday> updateHoliday(
            @PathVariable Integer id,
            @RequestBody Holiday holiday) {
        return ResponseEntity.ok(holidayService.updateHoliday(id, holiday));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHoliday(@PathVariable Integer id) {
        holidayService.deleteHoliday(id);
        return ResponseEntity.ok().build();
    }
}