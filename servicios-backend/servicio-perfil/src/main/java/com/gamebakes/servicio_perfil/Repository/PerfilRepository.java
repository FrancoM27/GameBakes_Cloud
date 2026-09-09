package com.gamebakes.servicio_perfil.Repository;

import com.gamebakes.servicio_perfil.Model.Perfil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PerfilRepository extends JpaRepository<Perfil, Long> {
    Optional<Perfil> findByUsuarioId(String usuarioId);
}
