package com.example.servicioproductos.Controller;

import com.example.servicioproductos.Model.Producto;
import com.example.servicioproductos.Service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @GetMapping
    public List<Producto> listar(){
        return productoService.listar();
    }

    @GetMapping("/vendedor/{vendedorId}")
    public List<Producto> listarPorVendedor(@PathVariable Long vendedorId){
        return productoService.listarPorVendedor(vendedorId);
    }


    @PostMapping
    public ResponseEntity<Producto> crear(@RequestBody Producto producto,
                                          @RequestHeader("X-User-Id") String vendedorIdStr,
                                          @RequestHeader("X-User-Role") String rol) {
        if (!"VENDEDOR".equals(rol)) {
            throw new RuntimeException("Solo los vendedores pueden crear productos");
        }

        Long vendedorId = Long.parseLong(vendedorIdStr);
        producto.setVendedorId(vendedorId);

        return ResponseEntity.ok(productoService.guardar(producto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId (@PathVariable Long id){
        return ResponseEntity.ok(productoService.obtenerPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id,
                                         @RequestHeader("X-User-Role") String rol){

        if (!"VENDEDOR".equals(rol)) {
            throw new RuntimeException("Acceso denegado");
        }

        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id,
                                           @RequestParam boolean activo,
                                           @RequestHeader("X-User-Role") String rol){
        try {
            if (!"VENDEDOR".equals(rol)) {
                throw new RuntimeException("Acceso denegado");
            }
            return ResponseEntity.ok(productoService.cambiarEstadoActivo(id, activo));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error al cambiar el estado: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable Long id,
                                               @RequestBody Producto producto,
                                               @RequestHeader("X-User-Id") String vendedorIdStr,
                                               @RequestHeader("X-User-Role") String rol) {

        if (!"VENDEDOR".equals(rol)) {
            throw new RuntimeException("Acceso denegado");
        }

        Long vendedorId = Long.parseLong(vendedorIdStr);
        producto.setId(id);
        producto.setVendedorId(vendedorId);

        return ResponseEntity.ok(productoService.guardar(producto));
    }

    @PutMapping("/{id}/restar-stock")
    public ResponseEntity<Producto> restarStock(@PathVariable Long id,
                                                @RequestParam int cantidad) {
        return ResponseEntity.ok(productoService.restarStock(id, cantidad));
    }
}