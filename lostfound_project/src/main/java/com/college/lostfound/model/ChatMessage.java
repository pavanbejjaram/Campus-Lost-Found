package com.college.lostfound.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private Student sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private Student receiver;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "item_id")
    private Item item;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }

    public ChatMessage() {}

    public ChatMessage(Student sender, Student receiver, String content, Item item) {
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.item = item;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getSender() { return sender; }
    public void setSender(Student sender) { this.sender = sender; }

    public Student getReceiver() { return receiver; }
    public void setReceiver(Student receiver) { this.receiver = receiver; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }
}
