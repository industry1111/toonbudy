package com.toonverti;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ToonvertiApplication {

    public static void main(String[] args) {
        SpringApplication.run(ToonvertiApplication.class, args);
    }

}
