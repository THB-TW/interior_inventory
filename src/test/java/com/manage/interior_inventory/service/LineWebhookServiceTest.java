package com.manage.interior_inventory.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.manage.interior_inventory.common.LineSignatureValidator;
import com.manage.interior_inventory.config.LineMessagingConfig;
import com.manage.interior_inventory.entity.CustomerInquiry;
import com.manage.interior_inventory.repository.CustomerInquiryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LineWebhookServiceTest {

    @Mock
    private LineSignatureValidator signatureValidator;

    @Mock
    private LineMessagingConfig config;

    @Mock
    private CustomerInquiryRepository inquiryRepository;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private LineWebhookService lineWebhookService;

    @BeforeEach
    void setUp() {
        // Since we injected the real ObjectMapper in the real code, we should set a real one here.
        ReflectionTestUtils.setField(lineWebhookService, "objectMapper", new ObjectMapper());
        ReflectionTestUtils.setField(lineWebhookService, "restTemplate", restTemplate);
    }

    @Test
    void testProcessWebhookPayload_Success() throws Exception {
        String jsonPayload = """
                {
                  "destination": "xxxxxxxxxx",
                  "events": [
                    {
                      "type": "message",
                      "message": {
                        "type": "text",
                        "id": "14353798921116",
                        "text": "姓名：張三、電話：0912345678、地址：台北市、時間：明天下午"
                      },
                      "timestamp": 1625665242211,
                      "source": {
                        "type": "user",
                        "userId": "U4af4980629..."
                      },
                      "replyToken": "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
                      "mode": "active"
                    }
                  ]
                }
                """;

        when(inquiryRepository.save(any(CustomerInquiry.class))).thenAnswer(i -> i.getArgument(0));
        when(config.getChannelToken()).thenReturn("mockToken");

        String mockProfileResponse = "{\"displayName\": \"張老闆的LINE\"}";
        when(restTemplate.exchange(
                eq("https://api.line.me/v2/bot/profile/U4af4980629..."),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(String.class)
        )).thenReturn(new ResponseEntity<>(mockProfileResponse, HttpStatus.OK));

        lineWebhookService.processWebhookPayload(jsonPayload);

        ArgumentCaptor<CustomerInquiry> captor = ArgumentCaptor.forClass(CustomerInquiry.class);
        verify(inquiryRepository).save(captor.capture());

        CustomerInquiry savedInquiry = captor.getValue();
        assertNotNull(savedInquiry);
        assertEquals("U4af4980629...", savedInquiry.getLineUserId());
        assertEquals("張老闆的LINE", savedInquiry.getLineUserName());
        assertEquals("張三", savedInquiry.getName());
        assertEquals("0912345678", savedInquiry.getPhone());
        assertEquals("台北市", savedInquiry.getAddress());
        assertEquals("希望場勘時間: 明天下午", savedInquiry.getWorkContent());
    }
}
