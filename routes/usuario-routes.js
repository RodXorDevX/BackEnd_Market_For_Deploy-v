const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuario-controller');

// Ruta GET /usuarios para obtener todos los usuarios
router.get('/', usuarioController.getUsuarios);

// Ruta POST /registro para registrar nuevos usuarios
router.post('/registro', usuarioController.registerUsuario);

// Ruta POST /login para autenticar usuarios
router.post('/login', usuarioController.loginUsuario);

module.exports = router;
