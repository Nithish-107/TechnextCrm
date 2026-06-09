package com.technext.crm.service;

import com.technext.crm.model.User;
import com.technext.crm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    public User createUser(User user) {
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        user.setCreatedAt(LocalDateTime.now());
        if (user.getIsActive() == null) user.setIsActive(true);
        return userRepository.save(user);
    }

    public User updateUser(Integer id, User user) {
        User existing = userRepository.findById(id).orElseThrow();
        existing.setName(user.getName());
        existing.setEmail(user.getEmail());
        existing.setRole(user.getRole());
        existing.setDepartment(user.getDepartment());
        existing.setEmployeeId(user.getEmployeeId());
        existing.setJoiningDate(user.getJoiningDate());
        existing.setWorkLocation(user.getWorkLocation());
        existing.setBasicSalary(user.getBasicSalary());
        existing.setPhone(user.getPhone());
        existing.setDateOfBirth(user.getDateOfBirth());
        existing.setPanNumber(user.getPanNumber());
        existing.setBankAccount(user.getBankAccount());
        existing.setBankName(user.getBankName());
        existing.setIfscCode(user.getIfscCode());
        existing.setProfilePicture(user.getProfilePicture());
        if (user.getIsActive() != null) existing.setIsActive(user.getIsActive());
        // Only update password if a new one is provided
        if (user.getPassword() != null && !user.getPassword().isEmpty()
                && !user.getPassword().startsWith("$2a$")) {
            existing.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(existing);
    }

    public User login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return null;
        User user = userOpt.get();

        // BCrypt password check
        if (user.getPassword() != null && user.getPassword().startsWith("$2a$")) {
            if (passwordEncoder.matches(password, user.getPassword())) {
                return user;
            }
            return null;
        }

        // Plain text fallback (old users before BCrypt) — auto-upgrade
        if (password.equals(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(password));
            userRepository.save(user);
            return user;
        }
        return null;
    }

    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    public boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public User updateSalary(Integer id, java.math.BigDecimal salary,
            String department, String employeeId, String role, java.time.LocalDate joiningDate) {
        User existing = userRepository.findById(id).orElseThrow();
        if (salary != null) existing.setBasicSalary(salary);
        if (department != null) existing.setDepartment(department);
        if (employeeId != null) existing.setEmployeeId(employeeId);
        if (role != null) existing.setRole(role);
        if (joiningDate != null) existing.setJoiningDate(joiningDate);
        return userRepository.save(existing);
    }
}