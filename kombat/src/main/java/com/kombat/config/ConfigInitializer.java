package com.kombat.config;

import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class ConfigInitializer {

    @PostConstruct
    public void init() {
        Config.loadFromFile();
        System.out.println("Config initialized!");
    }
}