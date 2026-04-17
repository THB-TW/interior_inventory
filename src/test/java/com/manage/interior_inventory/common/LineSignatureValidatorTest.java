package com.manage.interior_inventory.common;

import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LineSignatureValidatorTest {

    @Test
    void testValidateSignature_Success() throws Exception {
        LineSignatureValidator validator = new LineSignatureValidator();
        String channelSecret = "test_secret";
        String body = "{\"events\":[]}";

        SecretKeySpec key = new SecretKeySpec(channelSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(key);
        byte[] source = body.getBytes(StandardCharsets.UTF_8);
        String expectedSignature = Base64.getEncoder().encodeToString(mac.doFinal(source));

        assertTrue(validator.validateSignature(body, channelSecret, expectedSignature));
    }

    @Test
    void testValidateSignature_Failure() {
        LineSignatureValidator validator = new LineSignatureValidator();
        String channelSecret = "test_secret";
        String body = "{\"events\":[]}";
        String fakeSignature = "invalid_signature";

        assertFalse(validator.validateSignature(body, channelSecret, fakeSignature));
    }

    @Test
    void testValidateSignature_EmptyInputs() {
        LineSignatureValidator validator = new LineSignatureValidator();

        assertFalse(validator.validateSignature(null, "secret", "sig"));
        assertFalse(validator.validateSignature("body", null, "sig"));
        assertFalse(validator.validateSignature("body", "secret", null));
        assertFalse(validator.validateSignature("", "", ""));
    }
}
