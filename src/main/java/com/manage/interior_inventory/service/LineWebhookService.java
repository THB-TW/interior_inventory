package com.manage.interior_inventory.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.manage.interior_inventory.common.LineSignatureValidator;
import com.manage.interior_inventory.common.exception.BusinessException;
import com.manage.interior_inventory.config.LineMessagingConfig;
import com.manage.interior_inventory.dto.LineWebhookPayload;
import com.manage.interior_inventory.entity.CustomerInquiry;
import com.manage.interior_inventory.entity.InquiryStatus;
import com.manage.interior_inventory.repository.CustomerInquiryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class LineWebhookService {

    @Qualifier("customLineSignatureValidator")
    private final LineSignatureValidator signatureValidator;
    private final LineMessagingConfig config;
    private final CustomerInquiryRepository inquiryRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String LINE_REPLY_URL = "https://api.line.me/v2/bot/message/reply";

    public boolean validateSignature(String body, String signature) {
        return signatureValidator.validateSignature(body, config.getChannelSecret(), signature);
    }

    @Transactional
    public void processWebhookPayload(String body) {
        try {
            LineWebhookPayload payload = objectMapper.readValue(body, LineWebhookPayload.class);
            if (payload.getEvents() == null) {
                return;
            }

            for (LineWebhookPayload.Event event : payload.getEvents()) {
                if ("message".equals(event.getType()) && event.getMessage() != null && "text".equals(event.getMessage().getType())) {
                    String userId = event.getSource().getUserId();
                    String text = event.getMessage().getText();
                    String replyToken = event.getReplyToken();

                    CustomerInquiry inquiry = createInquiry(userId, text);

                    if (StringUtils.hasText(replyToken)) {
                        sendGuideMessage(replyToken);
                    }
                } else {
                    log.info("Ignored non-text message event type: {}", event.getType());
                }
            }

        } catch (JsonProcessingException e) {
            log.error("Failed to parse LINE webhook payload", e);
            throw new BusinessException("Invalid payload", e);
        }
    }

    private CustomerInquiry createInquiry(String userId, String text) {
        CustomerInquiry inquiry = CustomerInquiry.builder()
                .lineUserId(userId)
                .message(text)
                .status(InquiryStatus.PENDING)
                .build();

        // 嘗試解析姓名、電話、地址、時間
        parseAndSetDetails(inquiry, text);

        return inquiryRepository.save(inquiry);
    }

    private void parseAndSetDetails(CustomerInquiry inquiry, String text) {
        if (!StringUtils.hasText(text)) return;

        // 解析: 姓名：XXX、電話：XXX、地址：XXX、時間：XXX
        String namePattern = "姓名[：:]\\s*([^、\\n]+)";
        String phonePattern = "電話[：:]\\s*([^、\\n]+)";
        String addressPattern = "地址[：:]\\s*([^、\\n]+)";
        String timePattern = "時間[：:]\\s*([^、\\n]+)";

        inquiry.setName(extractPattern(namePattern, text));
        inquiry.setPhone(extractPattern(phonePattern, text));
        inquiry.setAddress(extractPattern(addressPattern, text));

        String timeStr = extractPattern(timePattern, text);
        if (StringUtils.hasText(timeStr)) {
            inquiry.setWorkContent("希望場勘時間: " + timeStr);
        }
    }

    private String extractPattern(String regex, String text) {
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return null;
    }

    private void sendGuideMessage(String replyToken) {
        String messageText = "您好！感謝您的詢問 \uD83C\uDFE0 \n" +
                "請問您的需求是什麼？（可附上照片與備註）\n\n" +
                "若要安排場勘，請填寫以下資料：\n" +
                "\uD83D\uDC49 [https://example.com/form]\n\n" +
                "或直接回覆：姓名：、電話：、地址：、時間：";

        Map<String, Object> message = new HashMap<>();
        message.put("type", "text");
        message.put("text", messageText);

        Map<String, Object> body = new HashMap<>();
        body.put("replyToken", replyToken);
        body.put("messages", List.of(message));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(config.getChannelToken() != null ? config.getChannelToken() : "");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.exchange(LINE_REPLY_URL, HttpMethod.POST, request, String.class);
            log.info("Replied guide message successfully");
        } catch (Exception e) {
            log.error("Failed to send reply message to LINE", e);
        }
    }
}
