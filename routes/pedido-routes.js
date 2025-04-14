const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido-controller');

// Ruta GET para obtener los pedidos de un usuario
router.get('/', pedidoController.getPedidos);

// Ruta POST para crear un pedido
router.post('/crear', pedidoController.createPedido);

//Estado del pedido
router.put('/:id/estado', pedidoController.updateEstadoPedido);

//Actualizar el estado del pedido
router.put('/actualizar-estado', pedidoController.actualizarEstadoPedido);

router.get('/usuario/:id', pedidoController.getPedidosPorUsuario);

module.exports = router;
