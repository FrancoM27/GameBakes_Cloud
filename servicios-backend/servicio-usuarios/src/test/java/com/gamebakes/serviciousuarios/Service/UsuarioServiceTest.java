package com.gamebakes.serviciousuarios.Service;

import com.gamebakes.serviciousuarios.DTO.UsuarioDTO;
import com.gamebakes.serviciousuarios.Model.Usuario;
import com.gamebakes.serviciousuarios.Repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private UsuarioService usuarioService;

    private Usuario usuario;
    private UsuarioDTO usuarioDTO;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setUsername("testuser");
        usuario.setEmail("test@example.com");
        usuario.setNombreCompleto("Test User");

        usuarioDTO = new UsuarioDTO();
        usuarioDTO.setUsername("updateduser");
        usuarioDTO.setEmail("updated@example.com");
        usuarioDTO.setNombreCompleto("Updated User");
    }

    @Test
    void actualizarPerfil_Exito() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.findByEmail("updated@example.com")).thenReturn(Optional.empty());
        when(usuarioRepository.findByUsername("updateduser")).thenReturn(Optional.empty());
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        Usuario result = usuarioService.actualizarPerfil(1L, usuarioDTO);

        assertNotNull(result);
        verify(usuarioRepository, times(1)).findById(1L);
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    void actualizarPerfil_UsuarioNoEncontrado() {
        when(usuarioRepository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            usuarioService.actualizarPerfil(999L, usuarioDTO);
        });

        assertEquals("Usuario no encontrado", exception.getMessage());
        verify(usuarioRepository, times(1)).findById(999L);
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void actualizarPerfil_EmailDuplicado() {
        Usuario otroUsuario = new Usuario();
        otroUsuario.setId(2L);
        otroUsuario.setEmail("updated@example.com");

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.findByEmail("updated@example.com")).thenReturn(Optional.of(otroUsuario));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            usuarioService.actualizarPerfil(1L, usuarioDTO);
        });

        assertEquals("El email ya está en uso", exception.getMessage());
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void actualizarPerfil_UsernameDuplicado() {
        Usuario otroUsuario = new Usuario();
        otroUsuario.setId(2L);
        otroUsuario.setUsername("updateduser");

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.findByEmail("updated@example.com")).thenReturn(Optional.empty());
        when(usuarioRepository.findByUsername("updateduser")).thenReturn(Optional.of(otroUsuario));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            usuarioService.actualizarPerfil(1L, usuarioDTO);
        });

        assertEquals("El nombre de usuario ya está en uso", exception.getMessage());
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }
}
