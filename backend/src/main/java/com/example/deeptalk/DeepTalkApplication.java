package com.example.deeptalk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class DeepTalkApplication {
    public static void main(String[] args) {
        SpringApplication.run(DeepTalkApplication.class, args);
        //zhush hallo
    }
}