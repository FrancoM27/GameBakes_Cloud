package com.gamebakes.servicio_perfil.DTO;

import lombok.Data;

@Data
public class PerfilDTO {
    private Long idPerfil;
    private String usuarioId;
    private String username;
    private String email;
    private String rol;
    private String nombreCompleto;
    private String telefono;
    private String direccion;
}