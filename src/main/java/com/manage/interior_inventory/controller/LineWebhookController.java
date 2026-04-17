package com.manage.interior_inventory.controller;

import com.manage.interior_inventory.service.LineWebhookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhook/line")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "LINE Webhook", description = "接收 LINE Messaging API Webhook 事件")
public class LineWebhookController {

    private final LineWebhookService lineWebhookService;

    @PostMapping
    @Operation(summary = "接收 LINE Webhook", description = "處理 LINE 用戶傳送的訊息，自動建立詢問單")
    public ResponseEntity<String> handleWebhook(
            @RequestHeader("X-Line-Signature") String signature,
            @RequestBody String body) {

        log.info("Received LINE webhook");

        if (!lineWebhookService.validateSignature(body, signature)) {
            log.warn("Invalid LINE signature");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid signature");
        }

        try {
            lineWebhookService.processWebhookPayload(body);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error processing LINE webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
