const pool = require('../config/db-config');

// Obtener todas las categorías
const getCategorias = async () => {
    const result = await pool.query('SELECT * FROM categorias');
    return result.rows;
};

// Crear una nueva categoría
const createCategoria = async (nombre) => {
    const result = await pool.query('INSERT INTO categorias (nombre) VALUES ($1) RETURNING *', [nombre]);
    return result.rows[0];
};

module.exports = {
    getCategorias,
    createCategoria
};
