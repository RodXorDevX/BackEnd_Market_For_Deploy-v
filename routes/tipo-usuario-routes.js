const express = require('express');
const router = express.Router();
const tipoUsuarioController = require('../controllers/tipo-usuario-controller');

// Ruta GET /tipo-usuario para obtener todos los tipos de usuario
router.get('/', tipoUsuarioController.getTiposUsuario);

// Ruta POST /tipo-usuario para crear nuevos tipos de usuario
router.post('/', tipoUsuarioController.createTipoUsuario);

module.exports = router;
