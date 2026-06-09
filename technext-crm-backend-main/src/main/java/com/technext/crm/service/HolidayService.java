package com.technext.crm.service;

import com.technext.crm.model.Holiday;
import com.technext.crm.repository.HolidayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class HolidayService {

    @Autowired
    private HolidayRepository holidayRepository;

    public List<Holiday> getAllHolidays() {
        return holidayRepository.findAll();
    }

    public List<Holiday> getHolidaysByType(String type) {
        return holidayRepository.findByType(type);
    }

    public List<Holiday> getHolidaysByMonth(int month, int year) {
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());
        return holidayRepository.findByDateBetween(from, to);
    }

    public Holiday addHoliday(Holiday holiday) {
        return holidayRepository.save(holiday);
    }

    public Holiday updateHoliday(Integer id, Holiday holiday) {
        holiday.setId(id);
        return holidayRepository.save(holiday);
    }

    public void deleteHoliday(Integer id) {
        holidayRepository.deleteById(id);
    }

    public boolean isHoliday(LocalDate date) {
        return holidayRepository.existsByDate(date);
    }
}