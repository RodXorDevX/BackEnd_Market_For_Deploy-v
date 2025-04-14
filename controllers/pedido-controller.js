const pool = require('../config/db-config');
const pedidoModel = require('../models/pedido-model');  

// Crear un nuevo pedido
// Crear un nuevo pedido
const createPedido = async (req, res) => {
    try {
      const { usuario_id, carrito } = req.body;
      const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  
      // Obtener el vendedor_id (debe ser el mismo para todos los productos del carrito)
      const vendedor_id = carrito[0].vendedor_id;
  
      // Imprimir vendedor_id para verificar que se está pasando correctamente
      console.log('vendedor_id:', vendedor_id);
  
      // Crear el pedido en la tabla 'pedidos' con vendedor_id
      const nuevoPedido = await pedidoModel.createPedido(usuario_id, total, vendedor_id);
  
      // Insertar los productos en la tabla 'pedido_items'
      for (const item of carrito) {
        await pedidoModel.createPedidoItem(nuevoPedido.id, item.producto_id, item.cantidad, item.precio);
      }
  
      res.status(201).json({ message: 'Pedido creado exitosamente', pedido: nuevoPedido });
    } catch (error) {
      console.error('Error creando el pedido:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  };
  

  
  const getPedidos = async (req, res) => {
    try {
      const { usuario_id, vendedor_id } = req.query; // Obtener los IDs desde las queries
  
      let query;
      let queryParams = [];
  
      // Si ambos parámetros están presentes (usuario_id y vendedor_id)
      if (usuario_id && vendedor_id) {
        query = `
          SELECT 
            p.id, 
            p.total, 
            p.status, 
            p.created_at,
            p.vendedor_id, 
            pi.producto_id, 
            pi.cantidad, 
            pi.precio_unitario, 
            pr.titulo, 
            pr.imagen, 
            u.nombre AS usuario_nombre
          FROM pedidos p
          JOIN pedido_items pi ON p.id = pi.pedido_id
          JOIN productos pr ON pi.producto_id = pr.id
          JOIN usuarios u ON p.usuario_id = u.id
          WHERE p.usuario_id = $1 AND p.vendedor_id = $2
        `;
        queryParams = [usuario_id, vendedor_id];
      } 
      // Si solo hay vendedor_id, obtener pedidos por vendedor
      else if (vendedor_id) {
        query = `
          SELECT 
            p.id, 
            p.total, 
            p.status, 
            p.created_at,
            p.vendedor_id, 
            pi.producto_id, 
            pi.cantidad, 
            pi.precio_unitario, 
            pr.titulo, 
            pr.imagen, 
            u.nombre AS usuario_nombre
          FROM pedidos p
          JOIN pedido_items pi ON p.id = pi.pedido_id
          JOIN productos pr ON pi.producto_id = pr.id
          JOIN usuarios u ON p.usuario_id = u.id
          WHERE p.vendedor_id = $1
        `;
        queryParams = [vendedor_id];
      } 
      // Si no hay vendedor_id, obtener pedidos solo por usuario_id
      else if (usuario_id) {
        query = `
          SELECT 
            p.id, 
            p.total, 
            p.status, 
            p.created_at,  
            p.vendedor_id, 
            pi.producto_id, 
            pi.cantidad, 
            pi.precio_unitario, 
            pr.titulo, 
            pr.imagen, 
            u.nombre AS usuario_nombre
          FROM pedidos p
          JOIN pedido_items pi ON p.id = pi.pedido_id
          JOIN productos pr ON pi.producto_id = pr.id
          JOIN usuarios u ON p.usuario_id = u.id
          WHERE p.usuario_id = $1
        `;
        queryParams = [usuario_id];
      }
  
      // Ejecutar la consulta con los parámetros
      const result = await pool.query(query, queryParams);
      res.status(200).json(result.rows);  // Devolver los pedidos con productos y nombre de usuario asociados
    } catch (error) {
      console.error('Error obteniendo los pedidos:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  };
  
  const updateEstadoPedido = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
  
    try {
      const result = await pool.query(
        'UPDATE pedidos SET status = $1 WHERE id = $2 RETURNING *',
        [estado, id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }
  
      res.json({ status: result.rows[0].status });
    } catch (error) {
      console.error('Error al actualizar el estado del pedido:', error);
      res.status(500).json({ error: 'Error del servidor' });
    }
  };
  
  // Si quieres usar la otra ruta también
  const actualizarEstadoPedido = async (req, res) => {
    const { pedido_id, nuevo_estado } = req.body;
  
    try {
      const result = await pool.query(
        'UPDATE pedidos SET status = $1 WHERE id = $2 RETURNING *',
        [nuevo_estado, pedido_id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }
  
      res.json({ message: 'Estado actualizado correctamente', pedido: result.rows[0] });
    } catch (error) {
      console.error('Error actualizando estado:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  };
  
  const getPedidosPorUsuario = async (req, res) => {
    const userId = req.params.id;
    try {
      const result = await pool.query(
        'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Error al obtener pedidos del usuario:", err);
      res.status(500).json({ error: 'Error al obtener pedidos del usuario' });
    }
  };

module.exports = {
  createPedido,
  getPedidos,
  actualizarEstadoPedido,
  updateEstadoPedido,
  getPedidosPorUsuario
};
