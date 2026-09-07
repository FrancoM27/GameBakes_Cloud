package com.gamebakes.serviciousuarios.Config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class SecurityConfigTest {

    @Test
    void securityConfig_CreacionExitosa() {
        SecurityConfig securityConfig = new SecurityConfig();
        assertNotNull(securityConfig);
    }
}
