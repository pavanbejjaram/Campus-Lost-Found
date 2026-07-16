package com.college.lostfound.controller;

import com.college.lostfound.model.ChatMessage;
import com.college.lostfound.model.Student;
import com.college.lostfound.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @GetMapping("/history/{u1}/{u2}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable Long u1, @PathVariable Long u2) {
        List<ChatMessage> history = chatMessageRepository.findChatHistory(u1, u2);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/partners/{userId}")
    public ResponseEntity<List<Student>> getChatPartners(@PathVariable Long userId) {
        List<Student> partners = chatMessageRepository.findChatPartners(userId);
        return ResponseEntity.ok(partners);
    }
}
