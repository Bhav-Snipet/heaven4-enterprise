package com.heaven4;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = "spring.flyway.enabled=false")
@ActiveProfiles("local")
public class FixFlywayTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    public void fixIt() {
        jdbcTemplate.execute("DROP TABLE IF EXISTS complaints CASCADE");
        jdbcTemplate.execute("DELETE FROM flyway_schema_history WHERE version = '11'");
        jdbcTemplate.execute("DELETE FROM flyway_schema_history WHERE version = '12'");
        System.out.println("FLYWAY FIXED COMPLETELY");
    }
}
