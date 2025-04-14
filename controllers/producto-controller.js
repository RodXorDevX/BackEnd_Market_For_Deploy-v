// --- START OF FILE producto-controller.js ---

const productoModel = require('../models/producto-model');
const { getProductosHATEOAS } = require('../utils/hateoas-util');

// Obtener productos con paginación, ordenamiento y filtrado opcional por vendedor
const getProductos = async (req, res) => {
  try {
      // Destructure potential filters including vendedor_id
      const { limit = 100, page = 1, order_by, vendedor_id } = req.query;

      // Validate pagination parameters
      if (isNaN(limit) || isNaN(page) || page < 1 || limit < 1) {
          return res.status(400).json({ error: 'Parámetros de paginación inválidos' });
      }
      // Validate vendedor_id if provided (optional, depends on requirements)
      if (vendedor_id && isNaN(parseInt(vendedor_id))) {
           return res.status(400).json({ error: 'Parámetro vendedor_id inválido' });
      }

      // Pass vendedor_id to the model function
      const productos = await productoModel.getProductos(
          parseInt(limit),
          parseInt(page),
          order_by,
          vendedor_id ? parseInt(vendedor_id) : undefined // Pass parsed ID or undefined
      );

      // Apply HATEOAS formatting
      res.json(getProductosHATEOAS(productos));  // Esta línea formatea y envía los datos
  } catch (error) {
      console.error('Error obteniendo los productos:', error);
      res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Obtener productos con filtros (Kept as is, uses a different endpoint /productos/filtros)
const getProductosFiltrados = async (req, res) => {
    try {
        // This uses 'vendedor' query param based on original code. Adjust if needed.
        const { precio_max, precio_min, categoria, vendedor } = req.query;
        const productos = await productoModel.getProductosFiltrados({
            precio_max,
            precio_min,
            categoria,
            // Pass vendedor param as vendedor_id to the model function if needed
            vendedor_id: vendedor ? parseInt(vendedor) : undefined
        });
        res.json(productos); // Note: HATEOAS not applied here in original code
    } catch (error) {
        console.error('Error aplicando los filtros:', error);
        res.status(500).send('Error en el servidor');
    }
};

const createProducto = async (req, res) => {
  try {
      console.log("🟨 Datos recibidos en el backend:", req.body);
      const { titulo, descripcion, precio, categoria_id, vendedor_id, imagen, stock } = req.body;

      // Validación de datos obligatorios
      if (!titulo || !descripcion || !precio || !categoria_id || !vendedor_id || !imagen || !stock) {
          return res.status(400).json({ error: "Faltan datos obligatorios" });
      }

      // Crear el producto en la base de datos
      const productoData = { titulo, descripcion, precio, categoria_id, vendedor_id, imagen, stock };
      const nuevoProducto = await productoModel.createProducto(productoData);

      // Devolver el producto creado con código 201 (Creado)
      res.status(201).json(nuevoProducto);
  } catch (error) {
      console.error("🔥 Error creando el producto:", error);
      res.status(500).json({ error: "Error en el servidor" });
  }
};


  const getProductoPorId = async (req, res) => {
    try {
      const { id } = req.params;
      const producto = await productoModel.getProductoPorId(id);
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json(producto);
    } catch (error) {
      console.error('Error obteniendo el producto:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  };
// Actualizar un producto existente
const updateProducto = async (req, res) => {
    try {
      const { id } = req.params;
      const productoData = req.body;
      console.log('🟨 Datos recibidos en el backend:', productoData);
      // Verificar si el producto existe
      const productoExistente = await productoModel.getProductoPorId(id);
      if (!productoExistente) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      
      // Actualizar el producto
      const productoActualizado = await productoModel.updateProducto(id, productoData);
      res.json(productoActualizado);
      console.log('Producto actualizado:', productoActualizado);
    } catch (error) {
      console.error('Error actualizando el producto:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  };

// Función para eliminar un producto
const deleteProducto = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await productoModel.deleteProducto(id);
        if (result) {
            return res.status(204).send(); // No content
        } else {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error eliminando el producto:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Agregar a la lista de exports
module.exports = {
    getProductos,
    getProductosFiltrados,
    createProducto,
    getProductoPorId,
    updateProducto,
    deleteProducto
};