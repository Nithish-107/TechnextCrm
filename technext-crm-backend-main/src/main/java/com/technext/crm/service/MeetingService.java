package com.technext.crm.service;

import com.technext.crm.model.Meeting;
import com.technext.crm.repository.MeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MeetingService {

    @Autowired
    private MeetingRepository meetingRepository;

    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAll();
    }

    public Optional<Meeting> getMeetingById(Integer id) {
        return meetingRepository.findById(id);
    }

    public List<Meeting> getMeetingsByOwner(Integer ownerId) {
        return meetingRepository.findByOwnerId(ownerId);
    }

    public List<Meeting> getMeetingsByStatus(String status) {
        return meetingRepository.findByStatus(status);
    }

    public Meeting createMeeting(Meeting meeting) {
        return meetingRepository.save(meeting);
    }

    public Meeting updateMeeting(Integer id, Meeting meeting) {
        meeting.setId(id);
        return meetingRepository.save(meeting);
    }

    public void deleteMeeting(Integer id) {
        meetingRepository.deleteById(id);
    }
}