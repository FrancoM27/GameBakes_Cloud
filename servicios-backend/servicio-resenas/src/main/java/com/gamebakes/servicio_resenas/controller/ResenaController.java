package com.gamebakes.servicio_resenas.controller;

import com.gamebakes.servicio_resenas.model.Resena;
import com.gamebakes.servicio_resenas.service.ResenaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/resenas")
public class ResenaController {
    @Autowired
    private ResenaService resenaService;

    //Listar reseñas por producto (Público)
    @GetMapping("/producto/{id}")
    public ResponseEntity<List<Resena>> listarPorProducto(@PathVariable Long id) {
        List<Resena> resenas = resenaService.obtenerPorProducto(id);
        return ResponseEntity.ok(resenas);
    }

    //Crear reseña (Protegido por Gateway)
    @PostMapping
    public ResponseEntity<Resena> crear(
            @RequestBody Resena resena,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        
        //Si el Gateway envió el ID del usuario, lo asignamos al clienteId del modelo
        if (userId != null) {
            resena.setClienteId(Long.parseLong(userId));
        }

        Resena nuevaResena = resenaService.guardarResena(resena);
        return ResponseEntity.ok(nuevaResena);
    }

    //Listar por vendedor
    @GetMapping("/vendedor/{vendedorId}")
    public ResponseEntity<List<Resena>> listarPorVendedor(@PathVariable String vendedorId) {
        List<Resena> resenas = resenaService.obtenerPorVendedor(vendedorId);
        return ResponseEntity.ok(resenas);
    }

    //Listar por cliente (Protegido por Gateway)
    @GetMapping("/cliente")
    public ResponseEntity<List<Resena>> listarPorCliente(@RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId == null) {
            System.out.println("Error: X-User-Id header is null");
            return ResponseEntity.badRequest().build();
        }
        System.out.println("Obteniendo reseñas para cliente ID: " + userId);
        List<Resena> resenas = resenaService.obtenerPorCliente(Long.parseLong(userId));
        System.out.println("Reseñas encontradas: " + resenas.size());
        return ResponseEntity.ok(resenas);
    }

    //Responder reseña (Vendedor)
    @PutMapping("/{id}/responder")
    public ResponseEntity<Resena> responder(@PathVariable Long id, @RequestBody String respuesta) {
        String textoLimpio = respuesta.replace("\"", "");
        Resena resenaActualizada = resenaService.responderResena(id, textoLimpio);
        return ResponseEntity.ok(resenaActualizada);
    }
}