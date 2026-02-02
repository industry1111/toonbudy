package com.toonverti.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/**
 * 시간 관련 설정
 *
 * 모든 날짜/시간 계산은 서울 시간대 기준으로 통일
 */
@Configuration
public class ClockConfig {

    public static final ZoneId SEOUL_ZONE = ZoneId.of("Asia/Seoul");

    @Bean
    public Clock clock() {
        return Clock.system(SEOUL_ZONE);
    }
}
