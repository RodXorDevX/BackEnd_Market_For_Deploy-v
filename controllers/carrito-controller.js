const carritoModel = require('../models/carrito-model');
const usuarioModel = require('../models/usuario-model');
const productoModel = require('../models/producto-model');

// Agregar producto al carrito
const addProductoToCarrito = async (req, res) => {
    try {
        const { usuario_id, producto_id, cantidad } = req.body;
        
        // Validar campos obligatorios
        if (!usuario_id || !producto_id || !cantidad) {
            return res.status(400).json({ error: 'Los campos usuario_id, producto_id y cantidad son requeridos' });
        }
        
        // Verificar si el usuario existe
        const usuario = await usuarioModel.getUsuarioById(usuario_id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Verificar si el producto existe
        // Aquí necesitaríamos un método en el modelo de producto para buscar por ID
        // Podríamos agregar esto al modelo de producto más adelante
        const producto = await pool.query('SELECT * FROM productos WHERE id = $1', [producto_id]);
        if (producto.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        // Verificar si el usuario tiene un carrito
        let carrito = await carritoModel.getCarritoByUsuarioId(usuario_id);
        
        // Si no tiene carrito, crear uno
        if (!carrito) {
            carrito = await carritoModel.createCarrito(usuario_id);
        }
        
        // Agregar producto al carrito
        const carritoItem = await carritoModel.addItemToCarrito(carrito.id, producto_id, cantidad);
        res.status(201).json(carritoItem);
    } catch (error) {
        console.error('Error agregando producto al carrito:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = {
    addProductoToCarrito
};
