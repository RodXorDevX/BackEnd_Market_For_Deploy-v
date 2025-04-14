const pool = require('../config/db-config');
const format = require('pg-format');

// Obtener todos los tipos de usuario
const getTiposUsuario = async () => {
    const result = await pool.query('SELECT * FROM tipo_usuario');
    return result.rows;
};

// Crear un nuevo tipo de usuario
const createTipoUsuario = async (nombre) => {
    const query = format(
        'INSERT INTO tipo_usuario (nombre) VALUES (%L) RETURNING *',
        nombre
    );
    const result = await pool.query(query);
    return result.rows[0];
};

module.exports = {
    getTiposUsuario,
    createTipoUsuario
};
