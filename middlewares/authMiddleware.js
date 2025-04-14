const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
        req.usuario = decoded; // Agregar usuario decodificado a la request
        next();
    } catch (error) {
        res.status(403).json({ error: 'Token inválido o expirado' });
    }
};

module.exports = verificarToken;
