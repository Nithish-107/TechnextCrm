//package com.technext.crm.controller;
//
//import com.technext.crm.model.Meeting;
//import com.technext.crm.service.MeetingService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.*;
//import java.util.List;
//import java.util.Optional;
//
//@RestController
//@RequestMapping("/api/meetings")
//@CrossOrigin(origins = "http://localhost:3000")
//public class MeetingController {
//
//    @Autowired
//    private MeetingService meetingService;
//
//    @GetMapping
//    public List<Meeting> getAllMeetings() {
//        return meetingService.getAllMeetings();
//    }
//
//    @GetMapping("/{id}")
//    public Optional<Meeting> getMeetingById(@PathVariable Integer id) {
//        return meetingService.getMeetingById(id);
//    }
//
//    @GetMapping("/owner/{ownerId}")
//    public List<Meeting> getMeetingsByOwner(@PathVariable Integer ownerId) {
//        return meetingService.getMeetingsByOwner(ownerId);
//    }
//
//    @GetMapping("/status/{status}")
//    public List<Meeting> getMeetingsByStatus(@PathVariable String status) {
//        return meetingService.getMeetingsByStatus(status);
//    }
//
//    @PostMapping
//    public Meeting createMeeting(@RequestBody Meeting meeting) {
//        return meetingService.createMeeting(meeting);
//    }
//
//    @PutMapping("/{id}")
//    public Meeting updateMeeting(@PathVariable Integer id, @RequestBody Meeting meeting) {
//        return meetingService.updateMeeting(id, meeting);
//    }
//
//    @DeleteMapping("/{id}")
//    public void deleteMeeting(@PathVariable Integer id) {
//        meetingService.deleteMeeting(id);
//    }
//}

package com.technext.crm.controller;

import com.technext.crm.model.Meeting;
import com.technext.crm.repository.MeetingRepository;
import com.technext.crm.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = "*")
public class MeetingController {

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private EmailService emailService;  // ← ADD THIS

    @GetMapping
    public List<Meeting> getAll() {
        return meetingRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Meeting meeting) {
        meeting.setCreatedAt(LocalDateTime.now());
        Meeting saved = meetingRepository.save(meeting);

        // ✅ Auto-send email to all participants on meeting creation
        if (saved.getParticipants() != null && !saved.getParticipants().isBlank()) {
            for (String raw : saved.getParticipants().split(",")) {
                String email = raw.trim();
                if (email.contains("@")) {
                    try {
                        emailService.sendMeetingScheduled(
                                email,
                                email.split("@")[0],
                                saved.getTitle(),
                                saved.getMeetingDate() != null ? saved.getMeetingDate().toString() : "TBD",
                                saved.getDuration() != null ? saved.getDuration() : "—",
                                saved.getLocation() != null ? saved.getLocation() : "TBD",
                                saved.getAgenda() != null ? saved.getAgenda() : "—"
                        );
                    } catch (Exception e) {
                        System.err.println("❌ Failed to send email to " + email + ": " + e.getMessage());
                    }
                }
            }
        }

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Meeting meeting) {
        meeting.setId(id);
        Meeting saved = meetingRepository.save(meeting);

        // ✅ Auto-send update email to all participants on meeting edit
        if (saved.getParticipants() != null && !saved.getParticipants().isBlank()) {
            for (String raw : saved.getParticipants().split(",")) {
                String email = raw.trim();
                if (email.contains("@")) {
                    try {
                        emailService.sendMeetingUpdated(
                                email,
                                email.split("@")[0],
                                saved.getTitle(),
                                saved.getMeetingDate() != null ? saved.getMeetingDate().toString() : "TBD",
                                saved.getDuration() != null ? saved.getDuration() : "-",
                                saved.getLocation() != null ? saved.getLocation() : "TBD",
                                saved.getAgenda() != null ? saved.getAgenda() : "-"
                        );
                    } catch (Exception e) {
                        System.err.println("❌ Failed to send update email to " + email + ": " + e.getMessage());
                    }
                }
            }
        }

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        // ✅ Send cancellation email before deleting
        meetingRepository.findById(id).ifPresent(meeting -> {
            if (meeting.getParticipants() != null && !meeting.getParticipants().isBlank()) {
                for (String raw : meeting.getParticipants().split(",")) {
                    String email = raw.trim();
                    if (email.contains("@")) {
                        try {
                            emailService.sendMeetingCancelled(
                                    email,
                                    email.split("@")[0],
                                    meeting.getTitle(),
                                    meeting.getMeetingDate() != null ? meeting.getMeetingDate().toString() : "TBD"
                            );
                        } catch (Exception e) {
                            System.err.println("❌ Failed to send cancel email to " + email);
                        }
                    }
                }
            }
        });

        meetingRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}