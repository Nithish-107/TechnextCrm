package com.technext.crm.controller;

import com.technext.crm.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "*")
public class EmailController {

    @Autowired
    private EmailService emailService;

    // ✅ Send manual email - Admin can send to anyone
    @PostMapping("/send")
    public ResponseEntity<?> sendManual(@RequestBody Map<String, String> req) {
        try {
            emailService.sendManualEmail(
                req.get("to"),
                req.get("subject"),
                req.get("message"),
                req.get("senderName")
            );
            return ResponseEntity.ok(Map.of("success", true, "message", "Email sent!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ✅ Send meeting email
    @PostMapping("/meeting")
    public ResponseEntity<?> sendMeeting(@RequestBody Map<String, Object> req) {
        try {
            String type = (String) req.get("type"); // scheduled/updated/cancelled
            String to = (String) req.get("to");
            String name = (String) req.get("name");
            String title = (String) req.get("title");
            String date = (String) req.get("date");

            if ("cancelled".equals(type)) {
                emailService.sendMeetingCancelled(to, name, title, date);
            } else if ("updated".equals(type)) {
                emailService.sendMeetingUpdated(to, name, title, date,
                    (String) req.get("duration"),
                    (String) req.get("location"),
                    (String) req.get("agenda"));
            } else {
                emailService.sendMeetingScheduled(to, name, title, date,
                    (String) req.get("duration"),
                    (String) req.get("location"),
                    (String) req.get("agenda"));
            }
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ✅ Send leave email
    @PostMapping("/leave")
    public ResponseEntity<?> sendLeave(@RequestBody Map<String, Object> req) {
        try {
            String status = (String) req.get("status");
            String to = (String) req.get("to");
            String name = (String) req.get("name");
            String leaveType = (String) req.get("leaveType");
            String fromDate = (String) req.get("fromDate");
            String toDate = (String) req.get("toDate");
            String approvedBy = (String) req.get("approvedBy");

            if ("Approved".equals(status)) {
                int days = Integer.parseInt(req.get("days").toString());
                emailService.sendLeaveApproved(to, name, leaveType,
                    fromDate, toDate, days, approvedBy);
            } else {
                emailService.sendLeaveRejected(to, name, leaveType,
                    fromDate, toDate, approvedBy);
            }
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ✅ Send payslip email
    @PostMapping("/payslip")
    public ResponseEntity<?> sendPayslip(@RequestBody Map<String, Object> req) {
        try {
            emailService.sendPayslipGenerated(
                (String) req.get("to"),
                (String) req.get("name"),
                (String) req.get("month"),
                Integer.parseInt(req.get("year").toString()),
                (String) req.get("netSalary"),
                (String) req.get("generatedBy")
            );
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ✅ Send interview email
    @PostMapping("/interview")
    public ResponseEntity<?> sendInterview(@RequestBody Map<String, Object> req) {
        try {
            emailService.sendInterviewScheduled(
                (String) req.get("to"),
                (String) req.get("candidateName"),
                (String) req.get("jobTitle"),
                (String) req.get("interviewDate"),
                (String) req.get("interviewTime"),
                (String) req.get("interviewer"),
                (String) req.get("mode"),
                (String) req.get("location")
            );
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}