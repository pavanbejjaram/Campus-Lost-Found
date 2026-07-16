package com.college.lostfound.config;

import com.college.lostfound.model.ChatMessage;
import com.college.lostfound.model.Item;
import com.college.lostfound.model.Student;
import com.college.lostfound.repository.ChatMessageRepository;
import com.college.lostfound.repository.ItemRepository;
import com.college.lostfound.repository.StudentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.net.URI;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final Map<Long, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long userId = getUserId(session);
        if (userId != null) {
            sessions.put(userId, session);
            System.out.println("WebSocket Connected for student ID: " + userId);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        ChatPayload chatPayload = objectMapper.readValue(payload, ChatPayload.class);

        Student sender = studentRepository.findById(chatPayload.getSenderId()).orElse(null);
        Student receiver = studentRepository.findById(chatPayload.getReceiverId()).orElse(null);
        if (sender == null || receiver == null) return;

        Item item = null;
        if (chatPayload.getItemId() != null) {
            item = itemRepository.findById(chatPayload.getItemId()).orElse(null);
        }

        ChatMessage chatMessage = new ChatMessage(sender, receiver, chatPayload.getContent(), item);
        chatMessage = chatMessageRepository.save(chatMessage);

        String jsonResponse = objectMapper.writeValueAsString(chatMessage);
        TextMessage textMessage = new TextMessage(jsonResponse);

        // Send to receiver if online
        WebSocketSession receiverSession = sessions.get(chatPayload.getReceiverId());
        if (receiverSession != null && receiverSession.isOpen()) {
            receiverSession.sendMessage(textMessage);
        }

        // Echo back to sender
        WebSocketSession senderSession = sessions.get(chatPayload.getSenderId());
        if (senderSession != null && senderSession.isOpen()) {
            senderSession.sendMessage(textMessage);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long userId = getUserId(session);
        if (userId != null) {
            sessions.remove(userId);
            System.out.println("WebSocket Disconnected for student ID: " + userId);
        }
    }

    private Long getUserId(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri == null) return null;
        String query = uri.getQuery();
        if (query == null) return null;
        for (String param : query.split("&")) {
            String[] pair = param.split("=");
            if (pair.length > 1 && "userId".equals(pair[0])) {
                try {
                    return Long.parseLong(pair[1]);
                } catch (NumberFormatException e) {
                    return null;
                }
            }
        }
        return null;
    }

    public static class ChatPayload {
        private Long senderId;
        private Long receiverId;
        private String content;
        private Long itemId;

        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }
        public Long getReceiverId() { return receiverId; }
        public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }
    }
}
