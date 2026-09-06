package com.gamebakes.serviciousuarios.Controller;

import com.gamebakes.serviciousuarios.DTO.LoginDTO;
import com.gamebakes.serviciousuarios.DTO.RegistroDTO;
import com.gamebakes.serviciousuarios.DTO.UsuarioDTO;
import com.gamebakes.serviciousuarios.Model.Usuario;
import com.gamebakes.serviciousuarios.Service.UsuarioService;
import jakarta.validation.Valid;
//import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PutMapping("/perfil")
    public ResponseEntity<Usuario> actualizarPerfil(@RequestHeader("X-User-Id") String userId,
                                                   @Valid @RequestBody UsuarioDTO dto) {
        
        Usuario usuarioActualizado = usuarioService.actualizarPerfil(Long.parseLong(userId), dto);
        return ResponseEntity.ok(usuarioActualizado);
    }


    
}
