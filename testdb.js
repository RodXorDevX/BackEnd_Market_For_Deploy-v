// Importación de dependencias
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const format = require('pg-format');

// Configuración inicial de Express
const app = express();
const PORT = 3000;

// Middlewares
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); // Permite el manejo de JSON en las solicitudes

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'db_marketplace_2',
    password: 'Pg123456',
    port: 5432,
});

// Middleware para loguear las solicitudes
const logRequest = (req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url} at ${new Date().toISOString()}`);
    console.log(`Query params: ${JSON.stringify(req.query)}`);
    next();
};
app.use(logRequest);

// Función para obtener productos con paginación y ordenamiento
const getProductos = async (limit, page, order_by) => {
    const offset = (page - 1) * limit;
    const order = order_by ? order_by.replace('_', ' ') : 'id ASC';
    const query = format('SELECT * FROM productos ORDER BY %s LIMIT %L OFFSET %L', order, limit, offset);
    const result = await pool.query(query);
    return result.rows;
};

// Función para generar estructura HATEOAS
const getProductosHATEOAS = (productos) => {
    return {
        total: productos.length,
        data: productos.map(p => ({
            ...p,
            links: [{
                rel: "self",
                href: `/productos/${p.id}`
            }]
        }))
    };
};

// Ruta GET /productos con paginación y ordenamiento
app.get('/productos', async (req, res) => {
    try {
        const { limit = 10, page = 1, order_by } = req.query;
        if (isNaN(limit) || isNaN(page) || page < 1 || limit < 1) {
            return res.status(400).json({ error: 'Parámetros de paginación inválidos' });
        }
        const productos = await getProductos(parseInt(limit), parseInt(page), order_by);
        res.json(getProductosHATEOAS(productos));
    } catch (error) {
        console.error('Error obteniendo los productos:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta GET /productos/filtros con múltiples parámetros de filtrado
app.get('/productos/filtros', async (req, res) => {
    try {
        const { precio_max, precio_min, categoria, vendedor } = req.query;
        let query = 'SELECT * FROM productos WHERE 1=1';
        const values = [];
        
        if (precio_max) {
            values.push(precio_max);
            query += format(' AND precio <= %L', precio_max);
        }
        if (precio_min) {
            values.push(precio_min);
            query += format(' AND precio >= %L', precio_min);
        }
        if (categoria) {
            values.push(categoria);
            query += format(' AND categoria_id = %L', categoria);
        }
        if (vendedor) {
            values.push(vendedor);
            query += format(' AND vendedor_id = %L', vendedor);
        }

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error aplicando los filtros:', error);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta POST /productos para crear nuevos productos
app.post('/productos', async (req, res) => {
    try {
        const { titulo, descripcion, precio, categoria_id, size, stock, imagen, vendedor_id } = req.body;
        const query = format(
            'INSERT INTO productos (titulo, descripcion, precio, categoria_id, size, stock, imagen, vendedor_id) VALUES (%L, %L, %L, %L, %L, %L, %L, %L) RETURNING *',
            titulo, descripcion, precio, categoria_id, size, stock, imagen, vendedor_id
        );
        const result = await pool.query(query);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando el producto:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta POST /carrito para agregar productos al carrito
app.post('/carrito', async (req, res) => {
    try {
        const { usuario_id, producto_id, cantidad } = req.body;
        
        // Validar campos obligatorios
        if (!usuario_id || !producto_id || !cantidad) {
            return res.status(400).json({ error: 'Los campos usuario_id, producto_id y cantidad son requeridos' });
        }
        
        // Verificar si el usuario existe
        const usuario = await pool.query('SELECT * FROM usuarios WHERE id = $1', [usuario_id]);
        if (usuario.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Verificar si el producto existe
        const producto = await pool.query('SELECT * FROM productos WHERE id = $1', [producto_id]);
        if (producto.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        // Verificar si el usuario tiene un carrito
        let carrito = await pool.query('SELECT * FROM carritos WHERE usuario_id = $1', [usuario_id]);
        
        // Si no tiene carrito, crear uno
        if (carrito.rows.length === 0) {
            carrito = await pool.query('INSERT INTO carritos (usuario_id) VALUES ($1) RETURNING *', [usuario_id]);
        }
        
        const carrito_id = carrito.rows[0].id;
        
        // Agregar producto al carrito
        const query = format(
            'INSERT INTO carrito_items (carrito_id, producto_id, cantidad) VALUES (%L, %L, %L) RETURNING *',
            carrito_id, producto_id, cantidad
        );
        const result = await pool.query(query);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error agregando producto al carrito:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta GET /usuarios para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, nombre, direccion FROM usuarios');
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo los usuarios:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta POST /registro para registrar nuevos usuarios
app.post('/registro', async (req, res) => {
    try {
        const { email, password, nombre, direccion } = req.body;
        const query = format(
            'INSERT INTO usuarios (email, password, nombre, direccion) VALUES (%L, %L, %L, %L) RETURNING id, email, nombre',
            email, password, nombre, direccion
        );
        const result = await pool.query(query);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error registrando el usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta POST /login para autenticar usuarios
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT id, email, nombre FROM usuarios WHERE email = $1 AND password = $2', [email, password]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta GET /categorias para obtener todas las categorías
app.get('/categorias', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias');
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo las categorías:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta POST /categorias para crear nuevas categorías
app.post('/categorias', async (req, res) => {
    try {
        const { nombre } = req.body;
        const result = await pool.query('INSERT INTO categorias (nombre) VALUES ($1) RETURNING *', [nombre]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando la categoría:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta GET /tipo-usuario para obtener todos los tipos de usuario
app.get('/tipo-usuario', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tipo_usuario');
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo los tipos de usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta POST /tipo-usuario para crear nuevos tipos de usuario
app.post('/tipo-usuario', async (req, res) => {
    try {
        const { nombre } = req.body;
        
        // Validar que el nombre esté presente
        if (!nombre) {
            return res.status(400).json({ error: 'El campo "nombre" es requerido' });
        }
        
        const query = format(
            'INSERT INTO tipo_usuario (nombre) VALUES (%L) RETURNING *',
            nombre
        );
        const result = await pool.query(query);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando el tipo de usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Inicio del servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});