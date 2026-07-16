package com.college.lostfound.controller;

import com.college.lostfound.model.Student;
import com.college.lostfound.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Student student) {
        if (studentRepository.existsByEmail(student.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already registered!"));
        }
        if (studentRepository.existsByStudentNumber(student.getStudentNumber())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Student number is already registered!"));
        }
        
        student.setAdmin(false); // Force default registration as student
        Student savedStudent = studentRepository.save(student);
        return ResponseEntity.ok(savedStudent);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        Optional<Student> studentOpt = studentRepository.findByEmail(email);
        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password!"));
        }

        Student student = studentOpt.get();
        if (!student.getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password!"));
        }

        return ResponseEntity.ok(student);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Student> getUserById(@PathVariable Long id) {
        return studentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
