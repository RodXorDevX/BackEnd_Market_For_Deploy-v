const tipoUsuarioModel = require('../models/tipo-usuario-model');

// Obtener todos los tipos de usuario
const getTiposUsuario = async (req, res) => {
    try {
        const tiposUsuario = await tipoUsuarioModel.getTiposUsuario();
        res.json(tiposUsuario);
    } catch (error) {
        console.error('Error obteniendo los tipos de usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Crear un nuevo tipo de usuario
const createTipoUsuario = async (req, res) => {
    try {
        const { nombre } = req.body;
        
        // Validar que el nombre esté presente
        if (!nombre) {
            return res.status(400).json({ error: 'El campo "nombre" es requerido' });
        }
        
        const nuevoTipoUsuario = await tipoUsuarioModel.createTipoUsuario(nombre);
        res.status(201).json(nuevoTipoUsuario);
    } catch (error) {
        console.error('Error creando el tipo de usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const updateEstadoPedido = async (req, res) => {
    const { id } = req.params;
    const { nuevoEstado } = req.body;
  
    try {
      const result = await pool.query(
        'UPDATE pedidos SET status = $1 WHERE id = $2 RETURNING *',
        [nuevoEstado, id]
      );
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Error al actualizar el estado del pedido:", error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  };
  

module.exports = {
    getTiposUsuario,
    createTipoUsuario,
    updateEstadoPedido
};
