package com.college.lostfound.controller;

import com.college.lostfound.model.Claim;
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
@RequestMapping("/api/claims")
@CrossOrigin(origins = "*")
public class ClaimController {

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping
    public ResponseEntity<?> submitClaim(@RequestBody Map<String, Object> request) {
        Long itemId = Long.valueOf(request.get("itemId").toString());
        Long claimerId = Long.valueOf(request.get("claimerId").toString());
        String proofDescription = request.get("proofDescription").toString();

        Optional<Item> itemOpt = itemRepository.findById(itemId);
        Optional<Student> claimerOpt = studentRepository.findById(claimerId);

        if (itemOpt.isEmpty() || claimerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Item or Student not found!"));
        }

        Item item = itemOpt.get();
        Student claimer = claimerOpt.get();

        if (claimRepository.existsByItemIdAndClaimerId(itemId, claimerId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "You have already submitted a claim for this item!"));
        }

        if (item.getReporter().getId().equals(claimerId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "You cannot claim your own reported item!"));
        }

        Claim claim = new Claim(item, claimer, proofDescription, "PENDING");
        Claim savedClaim = claimRepository.save(claim);
        return ResponseEntity.ok(savedClaim);
    }

    @GetMapping("/my/{claimerId}")
    public ResponseEntity<List<Claim>> getMyClaims(@PathVariable Long claimerId) {
        List<Claim> claims = claimRepository.findByClaimerId(claimerId);
        return ResponseEntity.ok(claims);
    }

    @GetMapping("/received/{reporterId}")
    public ResponseEntity<List<Claim>> getReceivedClaims(@PathVariable Long reporterId) {
        List<Claim> claims = claimRepository.findByItemReporterId(reporterId);
        return ResponseEntity.ok(claims);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateClaimStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String status = request.get("status"); // APPROVED or REJECTED
        Optional<Claim> claimOpt = claimRepository.findById(id);

        if (claimOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Claim claim = claimOpt.get();
        if (!"PENDING".equals(claim.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Claim status has already been finalized!"));
        }

        if ("APPROVED".equals(status)) {
            claim.setStatus("APPROVED");
            
            // Mark the item as RESOLVED
            Item item = claim.getItem();
            item.setStatus("RESOLVED");
            itemRepository.save(item);

            // Reject all other pending claims for this item
            List<Claim> otherClaims = claimRepository.findByItemId(item.getId());
            for (Claim c : otherClaims) {
                if (!c.getId().equals(claim.getId()) && "PENDING".equals(c.getStatus())) {
                    c.setStatus("REJECTED");
                    claimRepository.save(c);
                }
            }
        } else if ("REJECTED".equals(status)) {
            claim.setStatus("REJECTED");
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid status! Use APPROVED or REJECTED."));
        }

        Claim updatedClaim = claimRepository.save(claim);
        return ResponseEntity.ok(updatedClaim);
    }
}
