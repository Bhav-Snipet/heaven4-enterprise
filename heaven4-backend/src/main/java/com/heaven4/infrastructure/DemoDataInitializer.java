package com.heaven4.infrastructure;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Initializes demo data when running with the 'demo' profile.
 */
@Component
@Profile("demo")
@Slf4j
public class DemoDataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) {
        log.info("Demo Profile Active — Initializing Demo Data...");
        // TODO: Demo seed logic here
    }
}
