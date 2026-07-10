package com.heaven4.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI / Swagger configuration for Heaven4.
 *
 * <p>Swagger UI accessible at: http://localhost:8085/swagger-ui.html
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI heaven4OpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Heaven4 Enterprise API")
                        .description("""
                                Intelligent Restaurant Operations Platform (IROP)
                                
                                All endpoints require Bearer JWT authentication except:
                                - /api/v1/auth/** (login, OTP, token refresh)
                                - /actuator/health
                                - /api/v1/health
                                
                                Workspaces: Customer | Employee | Kitchen | Manager | Admin | Owner
                                """)
                        .version("0.1.0")
                        .contact(new Contact()
                                .name("Heaven4 Engineering Team")
                                .email("engineering@heaven4.com")))
                .servers(List.of(
                        new Server().url("http://localhost:8085").description("Local Development"),
                        new Server().url("https://api.heaven4.com").description("Production")
                ))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
