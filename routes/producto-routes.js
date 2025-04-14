const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto-controller');

// Ruta GET /productos con paginación y ordenamiento
router.get('/', productoController.getProductos);

// Ruta GET /productos/filtros con múltiples parámetros de filtrado
router.get('/filtros', productoController.getProductosFiltrados);

// Ruta POST /productos para crear nuevos productos
router.post('/', productoController.createProducto);

// Ruta GET /productos/:id para obtener productos por ID
router.get('/:id', productoController.getProductoPorId);

// Ruta PUT /productos/:id para actualizar un producto por ID
router.put('/:id', productoController.updateProducto);

// Ruta DELETE /productos/:id para eliminar un producto por ID
router.delete('/:id', productoController.deleteProducto);

module.exports = router;
