package com.technext.crm.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@Service
public class EmailService {

    @Value("${technext.mail.from}")
    private String fromEmail;

    @Value("${technext.mail.company}")
    private String companyName;

    @Value("${resend.api.key}")
    private String resendApiKey;

    // ✅ Generic send email
    @Async
    public void sendEmail(String to, String subject, String htmlBody) {
        try {
            String payload = String.format("""
            {
                "sender": {"email": "%s", "name": "TechNext CRM"},
                "to": [{"email": "%s"}],
                "subject": "%s",
                "htmlContent": %s
            }
            """, fromEmail, to, subject,
                    objectMapper.writeValueAsString(wrapTemplate(htmlBody)));

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response =
                    client.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("✅ Email sent to: " + to + " | Status: " + response.statusCode());
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("❌ Email failed to " + to + ": " + e.getMessage());
        }
    }

    // ✅ Meeting Scheduled
    public void sendMeetingScheduled(String to, String name, String title,
                                     String date, String duration, String location, String agenda) {
        String body = "<h2 style=\"color:#6366f1\">&#128197; Meeting Scheduled</h2>" +
                "<p>Dear <strong>" + name + "</strong>,</p>" +
                "<p>You have been added to a meeting. Here are the details:</p>" +
                "<table style=\"width:100%;border-collapse:collapse;margin:16px 0\">" +
                "<tr style=\"background:#f8f9fc\"><td style=\"padding:10px 14px;font-weight:700;width:140px\">Meeting Title</td><td style=\"padding:10px 14px\">" + title + "</td></tr>" +
                "<tr><td style=\"padding:10px 14px;font-weight:700\">Date</td><td style=\"padding:10px 14px\">" + date + "</td></tr>" +
                "<tr style=\"background:#f8f9fc\"><td style=\"padding:10px 14px;font-weight:700\">Duration</td><td style=\"padding:10px 14px\">" + duration + "</td></tr>" +
                "<tr><td style=\"padding:10px 14px;font-weight:700\">Location</td><td style=\"padding:10px 14px\">" + location + "</td></tr>" +
                "<tr style=\"background:#f8f9fc\"><td style=\"padding:10px 14px;font-weight:700\">Agenda</td><td style=\"padding:10px 14px\">" + agenda + "</td></tr>" +
                "</table>" +
                "<p>Please make sure to attend on time.</p>";
        sendEmail(to, "Meeting Scheduled: " + title, body);
    }

    // ✅ Meeting Updated
    public void sendMeetingUpdated(String to, String name, String title,
                                   String date, String duration, String location, String agenda) {
        String body = "<h2 style=\"color:#f59e0b\">&#128221; Meeting Updated</h2>" +
                "<p>Dear <strong>" + name + "</strong>,</p>" +
                "<p>A meeting you are part of has been <strong>updated</strong>. New details:</p>" +
                "<table style=\"width:100%;border-collapse:collapse;margin:16px 0\">" +
                "<tr style=\"background:#fffbeb\"><td style=\"padding:10px 14px;font-weight:700;width:140px\">Meeting Title</td><td style=\"padding:10px 14px\">" + title + "</td></tr>" +
                "<tr><td style=\"padding:10px 14px;font-weight:700\">New Date</td><td style=\"padding:10px 14px\">" + date + "</td></tr>" +
                "<tr style=\"background:#fffbeb\"><td style=\"padding:10px 14px;font-weight:700\">Duration</td><td style=\"padding:10px 14px\">" + duration + "</td></tr>" +
                "<tr><td style=\"padding:10px 14px;font-weight:700\">Location</td><td style=\"padding:10px 14px\">" + location + "</td></tr>" +
                "<tr style=\"background:#fffbeb\"><td style=\"padding:10px 14px;font-weight:700\">Agenda</td><td style=\"padding:10px 14px\">" + agenda + "</td></tr>" +
                "</table>" +
                "<p>Please update your calendar accordingly.</p>";
        sendEmail(to, "Meeting Updated: " + title, body);
    }

    // ✅ Meeting Cancelled
    public void sendMeetingCancelled(String to, String name, String title, String date) {
        String body = """
            <h2 style="color:#ef4444">❌ Meeting Cancelled</h2>
            <p>Dear <strong>%s</strong>,</p>
            <p>The following meeting has been <strong style="color:#ef4444">cancelled</strong>:</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr style="background:#fef2f2">
                    <td style="padding:10px 14px;font-weight:700;width:140px">Meeting Title</td>
                    <td style="padding:10px 14px">%s</td>
                </tr>
                <tr>
                    <td style="padding:10px 14px;font-weight:700">Scheduled Date</td>
                    <td style="padding:10px 14px">%s</td>
                </tr>
            </table>
            <p>This meeting will no longer take place. Please remove it from your calendar.</p>
            """.formatted(name, title, date);
        sendEmail(to, "❌ Meeting Cancelled: " + title, body);
    }

    // ✅ Leave Approved
    public void sendLeaveApproved(String to, String name, String leaveType,
            String fromDate, String toDate, int days, String approvedBy) {
        String body = """
            <h2 style="color:#10b981">✅ Leave Approved</h2>
            <p>Dear <strong>%s</strong>,</p>
            <p>Your leave request has been <strong style="color:#10b981">approved</strong>.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr style="background:#f0fdf4">
                    <td style="padding:10px 14px;font-weight:700;width:140px">Leave Type</td>
                    <td style="padding:10px 14px">%s</td>
                </tr>
                <tr>
                    <td style="padding:10px 14px;font-weight:700">From</td>
                    <td style="padding:10px 14px">%s</td>
                </tr>
                <tr style="background:#f0fdf4">
                    <td style="padding:10px 14px;font-weight:700">To</td>
                    <td style="padding:10px 14px">%s</td>
                </tr>
                <tr>
                    <td style="padding:10px 14px;font-weight:700">Total Days</td>
                    <td style="padding:10px 14px"><strong>%d days</strong></td>
                </tr>
                <tr style="background:#f0fdf4">
                    <td style="padding:10px 14px;font-weight:700">Approved By</td>
                    <td style="padding:10px 14px">%s</td>
                </tr>
            </table>
            <p>Enjoy your time off! Please ensure your work is handed over before your leave.</p>
            """.formatted(name, leaveType, fromDate, toDate, days, approvedBy);
        sendEmail(to, "✅ Leave Approved - " + leaveType, body);
    }

    // ✅ Leave Rejected
    public void sendLeaveRejected(String to, String name, String leaveType,
            String fromDate, String toDate, String rejectedBy) {
        String body = """
            <h2 style="color:#ef4444">❌ Leave Rejected</h2>
            <p>Dear <strong>%s</strong>,</p>
            <p>Your leave request has been <strong style="color:#ef4444">rejected</strong>.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr style="background:#fef2f2">
                    <td style="padding:10px 14px;font-weight:700;width:140px">Leave Type</td>
                    <td style="padding:10px 14px">%s</td>
                </tr>
                <tr>
                    <td style="padding:10px 14px;font-weight:700">From</td>
                    <td style="padding:10px 14px">%s</td>
                </tr>
                <tr style="background:#fef2f2">
                    <td style="padding:10px 14px;font-weight:700">To</td>
                    <td style="padding:10px 14px">%s</td>
                </tr>
                <tr>
                    <td style="padding:10px 14px;font-weight:700">Rejected By</td>
                    <td style="padding:10px 14px">%s</td>
                </tr>
            </table>
            <p>Please contact your manager for more information.</p>
            """.formatted(name, leaveType, fromDate, toDate, rejectedBy);
        sendEmail(to, "❌ Leave Rejected - " + leaveType, body);
    }

    // ✅ Payslip Generated
    public void sendPayslipGenerated(String to, String name, String month,
            int year, String netSalary, String generatedBy) {
        String body = """
            <h2 style="color:#6366f1">💵 Payslip Generated</h2>
            <p>Dear <strong>%s</strong>,</p>
            <p>Your payslip for <strong>%s %d</strong> has been generated.</p>
            <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;padding:24px;border-radius:12px;text-align:center;margin:16px 0">
                <div style="font-size:13px;opacity:0.8;margin-bottom:8px">NET SALARY — %s %d</div>
                <div style="font-size:32px;font-weight:900">%s</div>
            </div>
            <p>Please login to the TechNext CRM portal to view and download your payslip.</p>
            <p style="color:#6b7280;font-size:12px">Generated by: %s</p>
            """.formatted(name, month, year, month, year, netSalary, generatedBy);
        sendEmail(to, "💵 Payslip Ready - " + month + " " + year, body);
    }

    // ✅ Interview Scheduled
    public void sendInterviewScheduled(String to, String candidateName,
            String jobTitle, String interviewDate, String interviewTime,
            String interviewer, String mode, String location) {
        String body = """
            <h2 style="color:#8b5cf6">🎤 Interview Scheduled</h2>
            <p>Dear <strong>%s</strong>,</p>
            <p>Congratulations! Your interview has been scheduled for the position of <strong>%s</strong>.</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr style="background:#f5f3ff">
                    <td style="padding:10px 14px;font-weight:700;width:140px">Position</td>
                    <td style="padding:10px 14px">%s</td>
                </tr>
                <tr>
                    <td style="padding:10px 14px;font-weight:700">Date</td>
                    <td style="padding:10px 14px">%s</td>
                </tr>
                <tr style="background:#f5f3ff">
                    <td style="padding:10px 14px;font-weight:700">Time</td>
                    <td style="padding:10px 14px">%s</td>
                </tr>
                <tr>
                    <td style="padding:10px 14px;font-weight:700">Interviewer</td>
                    <td style="padding:10px 14px">%s</td>
                </tr>
                <tr style="background:#f5f3ff">
                    <td style="padding:10px 14px;font-weight:700">Mode</td>
                    <td style="padding:10px 14px">%s</td>
                </tr>
                <tr>
                    <td style="padding:10px 14px;font-weight:700">Location/Link</td>
                    <td style="padding:10px 14px">%s</td>
                </tr>
            </table>
            <p>Please be available 10 minutes before the scheduled time. All the best!</p>
            """.formatted(candidateName, jobTitle, jobTitle, interviewDate,
                         interviewTime, interviewer, mode, location);
        sendEmail(to, "🎤 Interview Scheduled - " + jobTitle, body);
    }

    // ✅ Manual Email from Admin
    public void sendManualEmail(String to, String subject, String message,
            String senderName) {
        String body = """
            <p>%s</p>
            <br>
            <p style="color:#6b7280;font-size:12px">Sent by: %s</p>
            """.formatted(message.replace("\n", "<br>"), senderName);
        sendEmail(to, subject, body);
    }

    // ✅ HTML Email Template with TechNext branding
    private String wrapTemplate(String content) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; background:#f8f9fc; margin:0; padding:0; }
                    .container { max-width:600px; margin:30px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
                    .header { background:linear-gradient(135deg,#6366f1,#4f46e5); padding:24px 32px; }
                    .header-title { color:#fff; font-size:18px; font-weight:800; margin:0; }
                    .header-sub { color:rgba(255,255,255,0.7); font-size:12px; margin:4px 0 0; }
                    .body { padding:32px; color:#374151; font-size:14px; line-height:1.6; }
                    .footer { background:#f8f9fc; padding:16px 32px; text-align:center; border-top:1px solid #e5e7f0; }
                    .footer p { color:#9ca3af; font-size:11px; margin:0; }
                    table { border:1px solid #e5e7f0; border-radius:8px; overflow:hidden; }
                    td { border-bottom:1px solid #f1f3f9; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <p class="header-title">TechNext Staffing Pvt. Ltd.</p>
                        <p class="header-sub">MSR Novel Office, Koramangala, Bengaluru 560034</p>
                    </div>
                    <div class="body">
                        %s
                    </div>
                    <div class="footer">
                        <p>This is an automated email from TechNext CRM Portal.</p>
                        <p>Please do not reply to this email. Contact your HR for queries.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(content);
    }
}