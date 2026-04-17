package com.manage.interior_inventory.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class LineMessagingConfig {

    @Value("${line.bot.channel-secret:}")
    private String channelSecret;

    @Value("${line.bot.channel-token:}")
    private String channelToken;
}
