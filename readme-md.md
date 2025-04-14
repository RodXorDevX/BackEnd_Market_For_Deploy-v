# Marketplace Backend (Hito 3)

Este proyecto es el backend para una aplicación de marketplace, desarrollado como parte del Hito 3.

## Estructura del proyecto

```
hito3_backend/
│   ├── config/           # Configuración (base de datos)
│   ├── controllers/      # Controladores para manejar la lógica de negocio
│   ├── middlewares/      # Middlewares personalizados
│   ├── models/           # Modelos para interactuar con la base de datos
│   ├── routes/           # Definición de rutas
│   ├── tests/            # Tests unitarios e integración
│   ├── utils/            # Utilidades y funciones auxiliares
│   ├── index.js            # Archivo principal de la aplicación
│   ├── package.json      # Dependencias del proyecto
│   └── README.md         # Documentación
```

## Instalación

1. Clona este repositorio
2. Instala las dependencias: `npm install`
3. Configura la base de datos PostgreSQL según los parámetros en `config/db.js`
4. Crea la base de datos y las tablas necesarias (ver script SQL)
5. Inicia el servidor: `npm start`

## Desarrollo

Para desarrollo con recarga automática: `npm run dev`

## Pruebas

Ejecuta las pruebas: `npm test`

## Endpoints API

### Productos
- `GET /productos` - Obtener productos con paginación y ordenamiento
- `GET /productos/filtros` - Filtrar productos por diversos criterios
- `POST /productos` - Crear un nuevo producto

### Usuarios
- `GET /usuarios` - Obtener todos los usuarios
- `POST /registro` - Registrar un nuevo usuario
- `POST /login` - Autenticar usuario

### Carrito
- `POST /carrito` - Agregar producto al carrito

### Categorías
- `GET /categorias` - Obtener todas las categorías
- `POST /categorias` - Crear una nueva categoría

### Tipos de Usuario
- `GET /tipo-usuario` - Obtener todos los tipos de usuario
- `POST /tipo-usuario` - Crear un nuevo tipo de usuario
