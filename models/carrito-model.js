const pool = require('../config/db-config')
const format = require('pg-format');

// Obtener carrito por usuario_id
const getCarritoByUsuarioId = async (usuario_id) => {
    const result = await pool.query('SELECT * FROM carritos WHERE usuario_id = $1', [usuario_id]);
    return result.rows[0];
};

// Crear un nuevo carrito
const createCarrito = async (usuario_id) => {
    const result = await pool.query('INSERT INTO carritos (usuario_id) VALUES ($1) RETURNING *', [usuario_id]);
    return result.rows[0];
};

// Agregar item al carrito
const addItemToCarrito = async (carrito_id, producto_id, cantidad) => {
    const query = format(
        'INSERT INTO carrito_items (carrito_id, producto_id, cantidad) VALUES (%L, %L, %L) RETURNING *',
        carrito_id, producto_id, cantidad
    );
    const result = await pool.query(query);
    return result.rows[0];
};

module.exports = {
    getCarritoByUsuarioId,
    createCarrito,
    addItemToCarrito
};
