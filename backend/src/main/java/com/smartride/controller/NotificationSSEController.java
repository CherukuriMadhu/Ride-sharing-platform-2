package com.smartride.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationSSEController {

    private static final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    @GetMapping(value = "/stream/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(@PathVariable Long userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError((e) -> emitters.remove(userId));

        // Send a connected event
        try {
            emitter.send(SseEmitter.event().name("connected").data("Real-time notifications enabled for user " + userId));
        } catch (IOException e) {
            emitters.remove(userId);
        }

        return emitter;
    }

    public static void sendNotification(Long userId, Object notification) {
        if (userId == null || notification == null) return;
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(notification));
            } catch (IOException e) {
                emitters.remove(userId);
            }
        }
    }
}
