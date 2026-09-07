package com.gamebakes.serviciousuarios.Service;

import com.gamebakes.serviciousuarios.DTO.UsuarioDTO;
import com.gamebakes.serviciousuarios.Model.Usuario;
import com.gamebakes.serviciousuarios.Repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Usuario actualizarPerfil(Long id, UsuarioDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuarioRepository.findByEmail(dto.getEmail()).ifPresent(existente -> {
            if (!existente.getId().equals(id)) {
                throw new RuntimeException("El email ya está en uso");
            }
        });

        usuarioRepository.findByUsername(dto.getUsername()).ifPresent(existente -> {
            if (!existente.getId().equals(id)) {
                throw new RuntimeException("El nombre de usuario ya está en uso");
            }
        });

        usuario.setNombreCompleto(dto.getNombreCompleto());
        usuario.setEmail(dto.getEmail());
        usuario.setUsername(dto.getUsername());

        return usuarioRepository.save(usuario);
    }
}
