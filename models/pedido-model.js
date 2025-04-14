const pool = require('../config/db-config');
const pedidoController = require('../controllers/pedido-controller');

// Crear un nuevo pedido
const createPedido = async (usuario_id, total, vendedor_id) => {
  const query = 'INSERT INTO pedidos (usuario_id, total, status, vendedor_id) VALUES ($1, $2, $3, $4) RETURNING *';
  const result = await pool.query(query, [usuario_id, total, 'Pendiente', vendedor_id]);
  console.log('Nuevo pedido insertado:', result.rows[0]);  // Asegúrate de ver el pedido con el vendedor_id
  return result.rows[0];
};


// Insertar un producto en el pedido
const createPedidoItem = async (pedido_id, producto_id, cantidad, precio_unitario) => {
  const query = 'INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)';
  await pool.query(query, [pedido_id, producto_id, cantidad, precio_unitario]);
};

const getPedidos = async (usuario_id) => {
  const query = `
    SELECT p.id, p.total, p.status, p.vendedor_id, pi.producto_id, pi.cantidad, pi.precio_unitario, pr.titulo, pr.imagen
    FROM pedidos p
    JOIN pedido_items pi ON p.id = pi.pedido_id
    JOIN productos pr ON pi.producto_id = pr.id
    WHERE p.usuario_id = $1
  `;

  const result = await pool.query(query, [usuario_id]);
  return result.rows;
};

module.exports = {
  createPedido,
  createPedidoItem,
  getPedidos,  // Exportar la nueva función
};