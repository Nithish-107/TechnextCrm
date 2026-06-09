package com.technext.crm.controller;

import com.technext.crm.model.User;
import com.technext.crm.security.JwtUtil;
import com.technext.crm.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        return userService.getAllUsers().stream()
            .filter(u -> u.getId().equals(id))
            .findFirst()
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOpt = userService.getAllUsers()
            .stream()
            .filter(u -> u.getEmail().equals(email))
            .findFirst();

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.status(401).body(response);
        }

        User user = userOpt.get();
        boolean passwordMatch = password.equals(user.getPassword()) ||
            passwordEncoder.matches(password, user.getPassword());

        if (!passwordMatch) {
            response.put("success", false);
            response.put("message", "Invalid password");
            return ResponseEntity.status(401).body(response);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        response.put("success", true);
        response.put("token", token);
        response.put("user", user);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean exists = userService.getAllUsers()
                .stream()
                .anyMatch(u -> u.getEmail().equals(user.getEmail()));

            if (exists) {
                response.put("success", false);
                response.put("message", "Email already exists");
                return ResponseEntity.status(400).body(response);
            }

            User saved = userService.createUser(user);
            response.put("success", true);
            response.put("user", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User user) {
        User updated = userService.updateUser(id, user);
        return ResponseEntity.ok(updated);
    }

    // Update salary and employee details - Admin/HR Manager only
    @PutMapping("/{id}/salary")
    public ResponseEntity<Map<String, Object>> updateSalary(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            User user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));

            if (body.containsKey("basicSalary") && body.get("basicSalary") != null)
                user.setBasicSalary(new BigDecimal(body.get("basicSalary").toString()));
            if (body.containsKey("department") && body.get("department") != null)
                user.setDepartment((String) body.get("department"));
            if (body.containsKey("employeeId") && body.get("employeeId") != null)
                user.setEmployeeId((String) body.get("employeeId"));
            if (body.containsKey("role") && body.get("role") != null)
                user.setRole((String) body.get("role"));
            if (body.containsKey("joiningDate") && body.get("joiningDate") != null) {
                user.setJoiningDate(java.time.LocalDate.parse(body.get("joiningDate").toString()));
            }

            User saved = userService.updateUser(id, user);
            response.put("success", true);
            response.put("user", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Update profile picture
    @PutMapping("/{id}/profile-picture")
    public ResponseEntity<Map<String, Object>> updateProfilePicture(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            User user = userService.getAllUsers()
                .stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .orElseThrow();

            user.setProfilePicture(body.get("profilePicture"));
            User saved = userService.updateUser(id, user);
            response.put("success", true);
            response.put("user", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}