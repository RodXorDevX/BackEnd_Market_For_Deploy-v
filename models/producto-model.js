// --- START OF FILE producto-model.js ---

const pool = require('../config/db-config');
const format = require('pg-format');

// Función para obtener productos con paginación, ordenamiento y filtro opcional por vendedor_id
const getProductos = async (limit, page, order_by, vendedor_id) => { // Add vendedor_id parameter
    const offset = (page - 1) * limit;
    // Default order or use provided order_by
    const order = order_by ? order_by.replace('_', ' ') : 'id ASC';

    let queryParams = []; // Array to hold query parameters for pg-format
    let query = 'SELECT * FROM productos';

    // Dynamically add WHERE clause if vendedor_id is provided
    if (vendedor_id !== undefined && vendedor_id !== null) {
        query += ' WHERE vendedor_id = %L'; // Use %L for literal values like numbers
        queryParams.push(vendedor_id);       // Add vendedor_id to parameters array
    } else {
        // If no specific filter, add a dummy WHERE clause if needed before ORDER BY/LIMIT
        // Or simply proceed if your base query doesn't need a WHERE
         query += ' WHERE 1=1'; // Placeholder if you might add other filters later
    }

    // Add ORDER BY, LIMIT, OFFSET
    // Use %s for identifiers like column names or ASC/DESC
    // Use %L for literal values like limit and offset numbers
    query += format(' ORDER BY %s LIMIT %L OFFSET %L', order, limit, offset);

    // Format the final query with parameters
    const finalQuery = format(query, ...queryParams); // Spread parameters into format

    console.log("Executing SQL:", finalQuery); // Log the generated query for debugging

    const result = await pool.query(finalQuery);
    return result.rows;
};

// Función para obtener productos con filtros (Updated to use vendedor_id consistently)
const getProductosFiltrados = async (filters) => {
    // Use vendedor_id consistently
    const { precio_max, precio_min, categoria, vendedor_id } = filters;
    let query = 'SELECT * FROM productos WHERE 1=1'; // Start with a base TRUE condition
    const queryParams = [];

    if (precio_max) {
        query += ' AND precio <= %L';
        queryParams.push(precio_max);
    }
    if (precio_min) {
        query += ' AND precio >= %L';
        queryParams.push(precio_min);
    }
    if (categoria) {
        query += ' AND categoria_id = %L';
        queryParams.push(categoria);
    }
    if (vendedor_id) { // Check for vendedor_id
        query += ' AND vendedor_id = %L'; // Filter by vendedor_id
        queryParams.push(vendedor_id);
    }

    const finalQuery = format(query, ...queryParams);
    console.log("Executing SQL (filtros):", finalQuery);

    const result = await pool.query(finalQuery);
    return result.rows;
};

// Función para crear un nuevo producto (Kept as is, already uses vendedor_id)
const createProducto = async (productoData) => {
    const { titulo, descripcion, precio, categoria_id, size, stock, imagen, vendedor_id } = productoData;
    // Ensure all required fields are present, especially vendedor_id
    if (!vendedor_id) throw new Error("vendedor_id es requerido para crear un producto");

    const query = format(
        'INSERT INTO productos (titulo, descripcion, precio, categoria_id, size, stock, imagen, vendedor_id) VALUES (%L, %L, %L, %L, %L, %L, %L, %L) RETURNING *',
        titulo, descripcion, precio, categoria_id, size, stock, imagen, vendedor_id
    );
    console.log("Executing SQL (create):", query);
    const result = await pool.query(query);
    return result.rows[0];
};

const getProductoPorId = async (id) => {
    const query = format('SELECT * FROM productos WHERE id = %L', id);
    const result = await pool.query(query);
    return result.rows[0]; // Puede ser undefined si no existe
  };
// Función para actualizar un producto existente
const updateProducto = async (id, productoData) => {
    // Extraer solo los campos que se pueden actualizar
    const { 
        titulo, 
        descripcion, 
        precio, 
        categoria_id, 
        size, 
        stock, 
        imagen,
        calificacion
    } = productoData;
    
    // Construir dinámicamente la consulta SQL para actualizar solo los campos proporcionados
    let updateFields = [];
    let queryParams = [id]; // El primer parámetro es siempre el ID
    let paramIndex = 2; // Comenzamos en 2 porque $1 ya está usado para el ID
    
    // Para cada campo, verificar si existe en productoData y agregarlo a la consulta
    if (titulo !== undefined) {
        updateFields.push(`titulo = $${paramIndex++}`);
        queryParams.push(titulo);
    }
    
    if (descripcion !== undefined) {
        updateFields.push(`descripcion = $${paramIndex++}`);
        queryParams.push(descripcion);
    }
    
    if (precio !== undefined) {
        updateFields.push(`precio = $${paramIndex++}`);
        queryParams.push(precio);
    }
    
    if (categoria_id !== undefined) {
        updateFields.push(`categoria_id = $${paramIndex++}`);
        queryParams.push(categoria_id);
    }
    
    if (size !== undefined) {
        updateFields.push(`size = $${paramIndex++}`);
        queryParams.push(size);
    }
    
    if (stock !== undefined) {
        updateFields.push(`stock = $${paramIndex++}`);
        queryParams.push(stock);
    }
    
    if (imagen !== undefined) {
        updateFields.push(`imagen = $${paramIndex++}`);
        queryParams.push(imagen);
    }
    
    if (calificacion !== undefined) {
        updateFields.push(`calificacion = $${paramIndex++}`);
        queryParams.push(calificacion);
    }
    
    // Si no hay campos para actualizar, devolver el producto existente
    if (updateFields.length === 0) {
        const result = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
        return result.rows[0];
    }
    
    // Construir la consulta final usando pg-format
    const query = format(`
        UPDATE productos 
        SET ${updateFields.join(', ')} 
        WHERE id = $1 
        RETURNING *
    `, ...queryParams);
    
    console.log("Executing SQL (update):", query);
    
    const result = await pool.query(query, queryParams);
    return result.rows[0];
};

// Función para eliminar un producto
const deleteProducto = async (id) => {
    const query = format('DELETE FROM productos WHERE id = %L RETURNING *', id);
    const result = await pool.query(query);
    return result.rowCount > 0; // Devuelve true si se eliminó un producto
};

// Agregar a la lista de exports
module.exports = {
    getProductos,
    getProductosFiltrados,
    createProducto,
    getProductoPorId,
    updateProducto,
    deleteProducto // Asegúrate de exportar esta función
};