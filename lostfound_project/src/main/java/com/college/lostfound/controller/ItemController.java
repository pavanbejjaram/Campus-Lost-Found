package com.college.lostfound.controller;

import com.college.lostfound.model.Item;
import com.college.lostfound.model.Student;
import com.college.lostfound.repository.ItemRepository;
import com.college.lostfound.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public ResponseEntity<List<Item>> getApprovedItems(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category) {
        
        List<Item> items;
        if (type != null && category != null) {
            items = itemRepository.findByStatusAndTypeAndCategory("APPROVED", type, category);
        } else if (type != null) {
            items = itemRepository.findByStatusAndType("APPROVED", type);
        } else if (category != null) {
            items = itemRepository.findByStatusAndCategory("APPROVED", category);
        } else {
            items = itemRepository.findByStatus("APPROVED");
        }
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getItemById(@PathVariable Long id) {
        return itemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my/{reporterId}")
    public ResponseEntity<List<Item>> getItemsByReporter(@PathVariable Long reporterId) {
        List<Item> items = itemRepository.findByReporterId(reporterId);
        return ResponseEntity.ok(items);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createItem(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("type") String type,
            @RequestParam("location") String location,
            @RequestParam("date") String date,
            @RequestParam("contactInfo") String contactInfo,
            @RequestParam("reporterId") Long reporterId,
            @RequestParam(value = "image", required = false) MultipartFile file
    ) {
        Student reporter = studentRepository.findById(reporterId).orElse(null);
        if (reporter == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Reporter student not found!"));
        }

        String imageUrl = null;
        if (file != null && !file.isEmpty()) {
            try {
                File uploadDir = new File("uploads").getAbsoluteFile();
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }
                String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                File destFile = new File(uploadDir, filename);
                file.transferTo(destFile.getAbsoluteFile());
                imageUrl = "/uploads/" + filename;
            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(500).body(Map.of("message", "Failed to upload image."));
            }
        }

        LocalDate localDate = LocalDate.parse(date);
        String status = reporter.isAdmin() ? "APPROVED" : "PENDING_APPROVAL";

        Item item = new Item(title, description, category, type, location, localDate, imageUrl, status, contactInfo, reporter);
        Item savedItem = itemRepository.save(item);
        return ResponseEntity.ok(savedItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        if (!itemRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        itemRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Item deleted successfully!"));
    }
}
