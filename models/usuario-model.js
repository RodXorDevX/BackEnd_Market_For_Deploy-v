const pool = require('../config/db-config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Obtener todos los usuarios
const getUsuarios = async () => {
  const result = await pool.query('SELECT id, email, nombre, direccion FROM usuarios');
  return result.rows;
};

// Registrar un nuevo usuario con contraseña encriptada
const registerUsuario = async (userData) => {
  const { email, password, nombre, direccion, avatar } = userData;

  // Verificar si el correo ya está registrado
  const existingUser = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    throw new Error('El correo electrónico ya está registrado');
  }

  // Encriptar la contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Insertar el nuevo usuario en la base de datos
  const query = `
    INSERT INTO usuarios (email, password, nombre, direccion, avatar)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, email, nombre, direccion, avatar
  `;
  const values = [email, hashedPassword, nombre, direccion, avatar];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Autenticar a un usuario con correo y contraseña
const loginUsuario = async (email, password) => {
  const query = 'SELECT * FROM usuarios WHERE email = $1';
  const values = [email];
  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    throw new Error('Usuario no encontrado');
  }

  const user = result.rows[0];

  // Comparar la contraseña proporcionada con la almacenada en la base de datos
  const passwordValida = await bcrypt.compare(password, user.password);
  if (!passwordValida) {
    throw new Error('Contraseña incorrecta');
  }

  // Generar el token JWT
  const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
    expiresIn: '1d'
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      direccion: user.direccion,
      avatar: user.avatar 
    }
  };
};

// Obtener un usuario por su ID
const getUsuarioById = async (id) => {
  const result = await pool.query(
    'SELECT id, email, nombre, direccion, avatar FROM usuarios WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

// Validar los datos de entrada al registrar o iniciar sesión
const validateUserData = (data) => {
  const { email, password, nombre, direccion, avatar } = data;
  if (!email || !password || !nombre || !direccion || !avatar) {
    throw new Error('Faltan campos obligatorios');
  }
};

module.exports = {
  getUsuarios,
  registerUsuario,
  loginUsuario,
  getUsuarioById,
  validateUserData
};
