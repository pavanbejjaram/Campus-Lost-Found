package com.college.lostfound.controller;

import com.college.lostfound.model.Item;
import com.college.lostfound.model.Student;
import com.college.lostfound.repository.ClaimRepository;
import com.college.lostfound.repository.ItemRepository;
import com.college.lostfound.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @GetMapping("/pending")
    public ResponseEntity<List<Item>> getPendingItems() {
        List<Item> pending = itemRepository.findByStatus("PENDING_APPROVAL");
        return ResponseEntity.ok(pending);
    }

    @PutMapping("/items/{id}/approve")
    public ResponseEntity<?> approveItem(@PathVariable Long id) {
        Optional<Item> itemOpt = itemRepository.findById(id);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Item item = itemOpt.get();
        item.setStatus("APPROVED");
        itemRepository.save(item);
        return ResponseEntity.ok(Map.of("message", "Item approved successfully!"));
    }

    @PutMapping("/items/{id}/reject")
    public ResponseEntity<?> rejectItem(@PathVariable Long id) {
        Optional<Item> itemOpt = itemRepository.findById(id);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Item item = itemOpt.get();
        item.setStatus("REJECTED");
        itemRepository.save(item);
        return ResponseEntity.ok(Map.of("message", "Item rejected successfully!"));
    }

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        List<Student> students = studentRepository.findAll();
        return ResponseEntity.ok(students);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long totalStudents = studentRepository.count();
        
        List<Item> allItems = itemRepository.findAll();
        long lostCount = allItems.stream().filter(i -> "LOST".equals(i.getType())).count();
        long foundCount = allItems.stream().filter(i -> "FOUND".equals(i.getType())).count();
        long pendingCount = allItems.stream().filter(i -> "PENDING_APPROVAL".equals(i.getStatus())).count();
        long resolvedCount = allItems.stream().filter(i -> "RESOLVED".equals(i.getStatus())).count();
        
        long totalClaims = claimRepository.count();

        return ResponseEntity.ok(Map.of(
                "totalStudents", totalStudents,
                "lostCount", lostCount,
                "foundCount", foundCount,
                "pendingCount", pendingCount,
                "resolvedCount", resolvedCount,
                "totalClaims", totalClaims
        ));
    }
}
