package com.gamebakes.servicio_pedidos.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gamebakes.servicio_pedidos.model.Pedido;
import com.gamebakes.servicio_pedidos.repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class PedidoListener {

    @Autowired
    private PedidoRepository pedidoRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "pago-exitoso-topic", groupId = "pedidos-group")
    public void escucharPago(String message) {
        try {
            System.out.println("Recibiendo notificación de pago para crear pedido...");
            System.out.println("Mensaje recibido: " + message);

            JsonNode jsonNode = objectMapper.readTree(message);

            if (!jsonNode.has("clienteId")) {
                System.err.println("No se pudo extraer clienteId del mensaje");
                return;
            }

            Long clienteId = jsonNode.get("clienteId").asLong();
            String clienteNombre = jsonNode.has("clienteNombre") ? jsonNode.get("clienteNombre").asText() : "Cliente";

            // ¡AQUÍ ESTÁ LA MAGIA NUEVA! Revisamos si viene un arreglo de "items"
            if (jsonNode.has("items") && jsonNode.get("items").isArray() && !jsonNode.get("items").isEmpty()) {
                for (JsonNode item : jsonNode.get("items")) {
                    if (item.has("productoId") && item.has("cantidad")) {
                        Long productoId = item.get("productoId").asLong();
                        Integer cantidad = item.get("cantidad").asInt();

                        System.out.println("Procesando item -> productoId: " + productoId + ", cantidad: " + cantidad);
                        crearPedido(clienteId, clienteNombre, productoId, cantidad);
                    }
                }
            }
            // Fallback por si mandan un solo producto en la raíz
            else if (jsonNode.has("productoId") && jsonNode.has("cantidad")) {
                Long productoId = jsonNode.get("productoId").asLong();
                Integer cantidad = jsonNode.get("cantidad").asInt();
                crearPedido(clienteId, clienteNombre, productoId, cantidad);
            }
            // Fallback de emergencia total
            else {
                Pedido nuevoPedido = new Pedido();
                nuevoPedido.setClienteId(clienteId);
                nuevoPedido.setClienteNombre(clienteNombre);
                nuevoPedido.setVendedorId("1");
                nuevoPedido.setProductoNombre("Producto Comprado");
                nuevoPedido.setEstado("PENDIENTE");
                nuevoPedido.setCantidad(1);

                pedidoRepository.save(nuevoPedido);
                System.out.println("¡Pedido creado de emergencia para el cliente: " + nuevoPedido.getClienteId());
            }

        } catch (Exception e) {
            System.err.println("Error al procesar mensaje de Kafka en formato JSON: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @SuppressWarnings("unchecked")
    private void crearPedido(Long clienteId, String clienteNombre, Long productoId, Integer cantidad) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String productoUrl = "http://servicio-productos:8085/api/productos/" + productoId;
            Map<String, Object> productoData = restTemplate.getForObject(productoUrl, Map.class);

            if (productoData != null) {
                Pedido nuevoPedido = new Pedido();
                nuevoPedido.setClienteId(clienteId);
                nuevoPedido.setClienteNombre(clienteNombre != null ? clienteNombre : "Cliente");
                nuevoPedido.setProductoId(productoId);
                nuevoPedido.setProductoNombre(productoData.get("nombre") != null ? productoData.get("nombre").toString() : "Producto");
                nuevoPedido.setVendedorId(productoData.get("vendedorId") != null ? productoData.get("vendedorId").toString() : "1");
                nuevoPedido.setCantidad(cantidad);
                nuevoPedido.setEstado("PENDIENTE");

                pedidoRepository.save(nuevoPedido);
                System.out.println("¡Pedido creado exitosamente para el cliente: " + nuevoPedido.getClienteId() + ", producto: " + nuevoPedido.getProductoNombre());
            }
        } catch (Exception e) {
            System.err.println("Error al crear pedido consultando el servicio de productos " + productoId + ": " + e.getMessage());
        }
    }
}