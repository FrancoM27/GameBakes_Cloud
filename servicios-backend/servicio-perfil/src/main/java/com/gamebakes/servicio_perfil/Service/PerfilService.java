package com.gamebakes.servicio_perfil.Service;

import com.gamebakes.servicio_perfil.DTO.PerfilDTO;
import com.gamebakes.servicio_perfil.Model.Perfil;
import com.gamebakes.servicio_perfil.Repository.PerfilRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class PerfilService {
    
    @Autowired
    private PerfilRepository perfilRepository;
    
    @Transactional(readOnly = true)
    public Optional<PerfilDTO> obtenerPerfilPorUsuarioId(String usuarioId) {
        return perfilRepository.findByUsuarioId(usuarioId)
            .map(this::convertirADTO);
    }
    
    @Transactional
    public PerfilDTO crearPerfil(PerfilDTO perfilDTO) {
        Perfil perfil = new Perfil();
        
        perfil.setUsuarioId(perfilDTO.getUsuarioId());
        perfil.setNombreCompleto(perfilDTO.getNombreCompleto());
        perfil.setTelefono(perfilDTO.getTelefono() != null ? perfilDTO.getTelefono() : "");
        perfil.setDireccion(perfilDTO.getDireccion() != null ? perfilDTO.getDireccion() : "");
        
        Perfil perfilGuardado = perfilRepository.save(perfil);
        return convertirADTO(perfilGuardado);
    }
    
    @Transactional
    public Optional<PerfilDTO> actualizarPerfil(String usuarioId, PerfilDTO perfilDTO) {
        return perfilRepository.findByUsuarioId(usuarioId)
            .map(perfil -> {
                perfil.setNombreCompleto(perfilDTO.getNombreCompleto());
                perfil.setTelefono(perfilDTO.getTelefono());
                perfil.setDireccion(perfilDTO.getDireccion());
                return convertirADTO(perfilRepository.save(perfil));
            });
    }
    
    private PerfilDTO convertirADTO(Perfil perfil) {
        PerfilDTO dto = new PerfilDTO();
        dto.setIdPerfil(perfil.getIdPerfil());
        dto.setUsuarioId(perfil.getUsuarioId());
        dto.setNombreCompleto(perfil.getNombreCompleto());
        dto.setTelefono(perfil.getTelefono());
        dto.setDireccion(perfil.getDireccion());
        
        return dto;
    }
}