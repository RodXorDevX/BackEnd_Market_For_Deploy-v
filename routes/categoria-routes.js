const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoria-controller');

// Ruta GET /categorias para obtener todas las categorías
router.get('/', categoriaController.getCategorias);

// Ruta POST /categorias para crear nuevas categorías
router.post('/', categoriaController.createCategoria);

module.exports = router;
