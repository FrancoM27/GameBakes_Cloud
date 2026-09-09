package com.example.servicioproductos.Repository;

import com.example.servicioproductos.Model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByCategoria(String categoria);
    List<Producto> findByActivoTrue();
    List<Producto> findByVendedorIdAndActivoTrue(String vendedorId);
    List<Producto> findByVendedorId(String vendedorId);
}