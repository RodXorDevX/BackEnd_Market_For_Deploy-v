const categoriaModel = require('../models/categoria-model');

// Obtener todas las categorías
const getCategorias = async (req, res) => {
    try {
        const categorias = await categoriaModel.getCategorias();
        res.json(categorias);
    } catch (error) {
        console.error('Error obteniendo las categorías:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Crear una nueva categoría
const createCategoria = async (req, res) => {
    try {
        const { nombre } = req.body;
        const nuevaCategoria = await categoriaModel.createCategoria(nombre);
        res.status(201).json(nuevaCategoria);
    } catch (error) {
        console.error('Error creando la categoría:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = {
    getCategorias,
    createCategoria
};
