package com.manage.interior_inventory.dto;

import lombok.Data;

import java.util.List;

@Data
public class LineWebhookPayload {
    private String destination;
    private List<Event> events;

    @Data
    public static class Event {
        private String type;
        private Message message;
        private Source source;
        private String replyToken;
        private String mode;
        private long timestamp;
    }

    @Data
    public static class Message {
        private String type;
        private String id;
        private String text;
    }

    @Data
    public static class Source {
        private String type;
        private String userId;
    }
}
