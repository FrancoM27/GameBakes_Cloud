package com.example.apigateway.filter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
 
import java.nio.charset.StandardCharsets;
import java.util.Base64;
 
/**
 * Decodifica el JWT de Entra ID que llega en el header Authorization
 * (ya validado previamente por el JWT Authorizer de AWS API Gateway)
 * y propaga el "oid" y el primer "role" hacia los microservicios internos
 * como headers X-User-Id / X-User-Role.
 *
 * No vuelve a verificar la firma: se confía en que AWS API Gateway ya
 * rechazó cualquier token inválido, expirado o con issuer/audience
 * incorrectos antes de reenviar la petición hasta este punto.
 */
@Component
public class JwtHeaderFilter implements GlobalFilter, Ordered {
 
    private final ObjectMapper objectMapper = new ObjectMapper();
 
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String authHeader = request.getHeaders().getFirst("Authorization");
 
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String[] parts = token.split("\\.");
 
            if (parts.length == 3) {
                try {
                    String payloadJson = new String(
                        Base64.getUrlDecoder().decode(parts[1]),
                        StandardCharsets.UTF_8
                    );
                    JsonNode claims = objectMapper.readTree(payloadJson);
 
                    String oid = claims.has("oid") ? claims.get("oid").asText() : null;
                    String rol = "SIN_ROL";
 
                    if (claims.has("roles") && claims.get("roles").isArray()
                            && !claims.get("roles").isEmpty()) {
                        rol = claims.get("roles").get(0).asText();
                    }
 
                    if (oid != null) {
                        ServerHttpRequest mutatedRequest = request.mutate()
                                .header("X-User-Id", oid)
                                .header("X-User-Role", rol)
                                .build();
 
                        exchange = exchange.mutate().request(mutatedRequest).build();
                    }
                } catch (Exception e) {
                    // Token malformado o payload no decodificable:
                    // dejamos pasar sin headers; el microservicio destino
                    // rechazará con 400 igual, que es el comportamiento seguro.
                }
            }
        }
 
        return chain.filter(exchange);
    }
 
    @Override
    public int getOrder() {
        // Se ejecuta temprano, antes de que la petición sea enrutada al destino.
        return -1;
    }
}