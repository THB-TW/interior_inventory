package com.manage.interior_inventory.common;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Component("customLineSignatureValidator")
public class LineSignatureValidator {

    public boolean validateSignature(String body, String channelSecret, String signature) {
        if (!StringUtils.hasText(body) || !StringUtils.hasText(channelSecret) || !StringUtils.hasText(signature)) {
            return false;
        }

        try {
            SecretKeySpec key = new SecretKeySpec(channelSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(key);
            byte[] source = body.getBytes(StandardCharsets.UTF_8);
            byte[] expectedSignatureBytes = mac.doFinal(source);
            byte[] providedSignatureBytes = Base64.getDecoder().decode(signature);

            return MessageDigest.isEqual(expectedSignatureBytes, providedSignatureBytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException | IllegalArgumentException e) {
            return false;
        }
    }
}
