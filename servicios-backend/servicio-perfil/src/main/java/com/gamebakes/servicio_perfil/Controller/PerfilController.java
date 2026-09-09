package com.gamebakes.servicio_perfil.Controller;

import com.gamebakes.servicio_perfil.DTO.PerfilDTO;
import com.gamebakes.servicio_perfil.Service.PerfilService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/perfil")
public class PerfilController {
    
    @Autowired
    private PerfilService perfilService;
    
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<PerfilDTO> obtenerPerfil(@PathVariable String usuarioId) {
        return perfilService.obtenerPerfilPorUsuarioId(usuarioId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> crearPerfil(@RequestBody PerfilDTO perfilDTO) {
        try {
            PerfilDTO nuevoPerfil = perfilService.crearPerfil(perfilDTO);
            return ResponseEntity.ok(nuevoPerfil);
        } catch (DataIntegrityViolationException e) {
            if (e.getMessage() != null && e.getMessage().contains("Duplicate entry")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("El perfil ya existe para este usuario");
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al crear el perfil");
        }
    }
    
    @PutMapping("/usuario/{usuarioId}")
    public ResponseEntity<PerfilDTO> actualizarPerfil(
            @PathVariable String usuarioId,
            @RequestBody PerfilDTO perfilDTO) {
        return perfilService.actualizarPerfil(usuarioId, perfilDTO)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}