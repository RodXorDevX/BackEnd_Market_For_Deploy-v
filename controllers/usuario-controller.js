const usuarioModel = require('../models/usuario-model');

// Obtener todos los usuarios
const getUsuarios = async (req, res) => {
    try {
        const usuarios = await usuarioModel.getUsuarios();
        res.json(usuarios);
    } catch (error) {
        console.error('Error obteniendo los usuarios:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Registrar un nuevo usuario
const registerUsuario = async (req, res) => {
    try {
        const { nombre, email, password, direccion, avatar } = req.body;

        // Validar que todos los campos requeridos estén presentes
        if (!nombre || !email || !password || !avatar) {
            return res.status(400).json({
                error: 'Los campos nombre, email, password y avatar son requeridos'
            });
        }

        // Validar que la contraseña tenga al menos 3 caracteres
        if (password.length < 3) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 3 caracteres'
            });
        }

        // Registrar el nuevo usuario con la función del modelo
        const nuevoUsuario = await usuarioModel.registerUsuario({ nombre, email, password, direccion, avatar });

        // Responder con el nuevo usuario
        res.status(201).json(nuevoUsuario);
    } catch (error) {
        console.error('Error registrando el usuario:', error);

        // Verificar si el error es por duplicación de correo electrónico
        if (error.message === 'El correo electrónico ya está registrado') {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
        }

        // Otros errores
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Autenticar un usuario
const loginUsuario = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validar campos
      if (!email || !password) {
        return res.status(400).json({
          error: 'Los campos email y password son requeridos'
        });
      }
  
      const usuario = await usuarioModel.loginUsuario(email, password);
  
      // Asegúrate de que el objeto 'usuario' contenga 'token' y 'user'
      if (!usuario || !usuario.token || !usuario.user) {
        return res.status(500).json({ error: 'Error al generar el token o los datos del usuario' });
      }
  
      // Enviar token y datos del usuario
      return res.json({
        token: usuario.token,
        usuario: usuario.user
      });
    } catch (error) {
      console.error('Error en el login:', error);
      if (error.message === 'Usuario no encontrado' || error.message === 'Contraseña incorrecta') {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      res.status(500).json({ error: 'Error en el servidor' });
    }
  };

// Obtener un usuario por ID
const getUsuarioById = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await usuarioModel.getUsuarioById(id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        console.error('Error obteniendo el usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = {
    getUsuarios,
    registerUsuario,
    loginUsuario,
    getUsuarioById
};
