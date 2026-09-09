package com.gamebakes.servicio_pedidos.repository;

import com.gamebakes.servicio_pedidos.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    //Para el seguimiento del Cliente
    List<Pedido> findByClienteId(Long clienteId);

    //Para la gestión del Vendedor
    List<Pedido> findByVendedorId(String vendedorId);

    //Para validar compras y estado entregado
    List<Pedido> findByClienteIdAndProductoId(Long clienteId, Long productoId);

    //Lo usamos para validar reseñas
    Optional<Pedido> findFirstByClienteIdAndProductoIdAndEstado(Long clienteId, Long productoId, String estado);

}