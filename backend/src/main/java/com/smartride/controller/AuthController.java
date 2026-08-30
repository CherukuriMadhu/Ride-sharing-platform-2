package com.smartride.controller;

import com.smartride.dto.AuthRequest;
import com.smartride.dto.AuthResponse;
import com.smartride.model.User;
import com.smartride.repository.UserRepository;
import com.smartride.security.JwtUtil;
import com.smartride.service.CustomUserDetailsService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.AuthenticationManager;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.nio.file.Files;

import java.nio.file.Path;

import java.nio.file.Paths;

import java.util.UUID;

import java.util.Map;

import com.smartride.service.EmailService;

import org.springframework.http.HttpStatus;

@RestController

@RequestMapping("/api/users")

@RequiredArgsConstructor

public class AuthController {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtUtil jwtUtil;

    private final AuthenticationManager authenticationManager;

    private final CustomUserDetailsService userDetailsService;

    private final EmailService emailService;

    @Autowired
    private com.smartride.service.NotificationService notificationService;

    @PostMapping(value = "/register", consumes = "multipart/form-data")

    public ResponseEntity<?> register(

            @RequestPart("data") User user,

            @RequestPart(value = "aadhaarFile", required = false) MultipartFile aadhaarFile,

            @RequestPart(value = "licenseFile", required = false) MultipartFile licenseFile,

            @RequestPart(value = "rcFile", required = false) MultipartFile rcFile,

            @RequestPart(value = "insuranceFile", required = false) MultipartFile insuranceFile) {

        System.out.println("Registration attempt for email: " + user.getEmail());

        System.out.println("User role: " + user.getRole());

        System.out.println("User name: " + user.getName());

        if (userRepository.existsByEmail(user.getEmail())) {

            System.out.println("Email already exists: " + user.getEmail());

            return ResponseEntity.badRequest().body("Email already exists");

        }

        try {

            // Handle defaults

            if (user.getRole() == null) {

                user.setRole(User.Role.PASSENGER);

                System.out.println("Set default role to PASSENGER");

            }

            if (user.getStatus() == null) {

                user.setStatus(User.AccountStatus.ACTIVE);

                System.out.println("Set default status to ACTIVE");

            }

            // Handle name logic

            if (user.getName() == null || user.getName().isEmpty()) {

                user.setName(user.getFirstName() + " " + user.getLastName());

                System.out.println("Generated name from first and last name");

            }

            // Encode password

            user.setPassword(passwordEncoder.encode(user.getPassword()));

            System.out.println("Password encoded successfully");

            // Handle File Uploads

            String uploadDir = "uploads/";

            Files.createDirectories(Paths.get(uploadDir));

            if (aadhaarFile != null && !aadhaarFile.isEmpty()) {

                user.setAadhaarPath(saveFile(aadhaarFile, uploadDir, "aadhaar"));

            }

            if (licenseFile != null && !licenseFile.isEmpty()) {

                user.setLicensePath(saveFile(licenseFile, uploadDir, "license"));

            }

            if (rcFile != null && !rcFile.isEmpty()) {

                user.setRcPath(saveFile(rcFile, uploadDir, "rc"));

            }

            if (insuranceFile != null && !insuranceFile.isEmpty()) {

                user.setInsurancePath(saveFile(insuranceFile, uploadDir, "insurance"));

            }

            userRepository.save(user);

            System.out.println("User saved successfully: " + user.getEmail() + " with role: " + user.getRole());
            
            if (user.getRole() == User.Role.DRIVER) {
               try {
                   notificationService.notifyNewDriverRegistration(user);
               } catch (Exception e) {}
            }

            return ResponseEntity.ok("User registered successfully");

        } catch (Exception e) {

            System.out.println("Registration error: " + e.getMessage());

            e.printStackTrace();

            return ResponseEntity.internalServerError().body("Registration failed: " + e.getMessage());

        }

    }

    private String saveFile(MultipartFile file, String uploadDir, String prefix) throws IOException {

        String fileName = prefix + "_" + UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        Path path = Paths.get(uploadDir + fileName);

        Files.copy(file.getInputStream(), path);

        return fileName;

    }

    @PostMapping(value = "/register-simple", consumes = "application/json")

    public ResponseEntity<?> registerSimple(@RequestBody com.smartride.dto.SimpleRegistrationRequest request) {

        System.out.println("Simple registration attempt for email: " + request.getEmail());

        if (request.getEmail() == null || request.getEmail().isEmpty()) {

            return ResponseEntity.badRequest().body("Email is required");

        }

        if (request.getPassword() == null || request.getPassword().isEmpty()) {

            return ResponseEntity.badRequest().body("Password is required");

        }

        if (userRepository.existsByEmail(request.getEmail())) {

            System.out.println("Email already exists: " + request.getEmail());

            return ResponseEntity.badRequest().body("Email already exists");

        }

        try {

            User user = new User();

            user.setEmail(request.getEmail());

            user.setPassword(passwordEncoder.encode(request.getPassword()));

            // Set name
            if (request.getName() != null && !request.getName().isEmpty()) {

                user.setName(request.getName());

            } else if (request.getFirstName() != null && request.getLastName() != null) {

                user.setName(request.getFirstName() + " " + request.getLastName());

            } else {

                user.setName(request.getEmail().split("@")[0]);

            }

            user.setFirstName(request.getFirstName());

            user.setLastName(request.getLastName());

            // Set role
            if (request.getRole() != null && !request.getRole().isEmpty()) {

                user.setRole(User.Role.valueOf(request.getRole().toUpperCase()));

            } else {

                user.setRole(User.Role.PASSENGER);

            }

            user.setStatus(User.AccountStatus.ACTIVE);

            user.setContactNo(request.getContactNo() != null ? request.getContactNo() : "0000000000");

            user.setGender(request.getGender() != null ? request.getGender() : "Other");

            if (request.getDob() != null && !request.getDob().isEmpty()) {

                user.setDob(java.time.LocalDate.parse(request.getDob()));

            } else {

                user.setDob(java.time.LocalDate.now().minusYears(20));

            }

            userRepository.save(user);

            System.out.println("Simple registration successful for: " + user.getEmail() + " with role: " + user.getRole());

            if (user.getRole() == User.Role.DRIVER) {

                try {

                    notificationService.notifyNewDriverRegistration(user);

                } catch (Exception e) {}

            }

            return ResponseEntity.ok("User registered successfully");

        } catch (Exception e) {

            System.err.println("Simple registration error: " + e.getMessage());

            e.printStackTrace();

            return ResponseEntity.internalServerError().body("Registration failed: " + e.getMessage());

        }

    }

    @PostMapping("/login")

    public ResponseEntity<?> login(@RequestBody AuthRequest request) {

        try {

            System.out.println("Login attempt for email: " + request.getEmail());

            authenticationManager.authenticate(

                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());

            final String token = jwtUtil.generateToken(userDetails);

            final User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

            System.out.println("Login successful for user: " + user.getEmail());

            return ResponseEntity.ok(new AuthResponse(token, user));

        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            System.out.println("Bad credentials for email: " + request.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            System.out.println("User not found: " + request.getEmail());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        } catch (Exception e) {
            System.err.println("CRITICAL Login error for email " + request.getEmail());
            System.err.println("Exception type: " + e.getClass().getName());
            System.err.println("Exception message: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Login failed due to an internal error: " + e.getMessage());
        }

    }

    @PostMapping("/forgot-password")

    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {

        String email = request.get("email");

        if (email == null || email.isEmpty()) {

            return ResponseEntity.badRequest().body("Email is required");

        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found with this email");

        }

        // Generate a random temporary password

        String tempPassword = UUID.randomUUID().toString().substring(0, 8);

        // Update user's password

        user.setPassword(passwordEncoder.encode(tempPassword));

        userRepository.save(user);

        // Send email with the new temporary password

        String subject = "SmartRide - Password Reset";

        String body = "Your password has been reset. Your new temporary password is: " + tempPassword

                + "\n\nPlease login and change your password immediately.";

        try {

            emailService.sendEmail(user.getEmail(), subject, body);

            return ResponseEntity.ok("A temporary password has been sent to your email.");

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()

                    .body("Failed to send email. Password was reset but email delivery failed.");

        }

    }

    @PostMapping("/update-password")

    public ResponseEntity<?> updatePassword(@RequestHeader("Authorization") String token,

            @RequestBody Map<String, String> request) {

        String currentPassword = request.get("currentPassword");

        String newPassword = request.get("newPassword");

        if (currentPassword == null || newPassword == null) {

            return ResponseEntity.badRequest().body("Both current and new passwords are required");

        }

        try {

            // Extract email from token

            String jwt = token.substring(7);

            String username = jwtUtil.extractUsername(jwt);

            User user = userRepository.findByEmail(username).orElse(null);

            if (user == null) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");

            }

            // Verify current password

            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {

                return ResponseEntity.badRequest().body("Incorrect current password");

            }

            // Update user's password

            user.setPassword(passwordEncoder.encode(newPassword));

            userRepository.save(user);

            return ResponseEntity.ok("Password updated successfully");

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");

        }

    }

    @GetMapping("/health")

    public ResponseEntity<String> health() {

        return ResponseEntity.ok("Backend is running");

    }

}
