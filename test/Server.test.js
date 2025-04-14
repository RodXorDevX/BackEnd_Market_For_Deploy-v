const request = require("supertest");
const app = require("../index.js");


// 1. TESTS DE REGISTRO DE USUARIO
//Nota: Al momento de registrar un nuevo usuario falla si se vuelve a usar el mismo correo. 
//      Para evitar esto, se recomienda usar un correo diferente o eliminar el usuario existente de la base de datos antes de ejecutar el test.
describe("POST /usuarios/registro", () => {
    it("Registra nuevo usuario --- devolver un código de estado 201", async () => {
        const newUser = {
            nombre: "Uni12",
            email: "uni12@gmail.com",
            password: "1234",
            direccion: "Sabana 123",
            avatar: "avatar1"
        };

        const response = await request(app)
            .post('/usuarios/registro')
            .send(newUser);

        expect(response.statusCode).toBe(201);  // Verifica que el estado sea 201
        expect(response.body).toHaveProperty('id');  // Verifica que la respuesta contiene un ID
        expect(response.body).toHaveProperty('nombre', 'Uni12');  // Verifica que el nombre sea el correcto
        expect(response.body).toHaveProperty('email', 'uni12@gmail.com');  // Verifica que el correo sea el correcto
        expect(response.body).toHaveProperty('direccion', 'Sabana 123');  // Verifica que la dirección sea la correcta
        expect(response.body).toHaveProperty('avatar', 'avatar1');  // Verifica que el avatar sea el correcto
    });

    it("debería devolver un error 400 si faltan campos obligatorios", async () => {
        const invalidUser = {
            nombre: "Macaco",
            email: "macaco@gmail.com",
            avatar: "avatar1" // Falta la contraseña
        };

        const response = await request(app)
            .post('/usuarios/registro')
            .send(invalidUser);

        expect(response.statusCode).toBe(400);  // Verifica que el estado sea 400 por error de validación, faltan campos.
        expect(response.body).toHaveProperty('error', 'Los campos nombre, email, password y avatar son requeridos');
    });
});


// 2. TESTS DE LOGIN DE USUARIO
describe('POST /usuarios/login', () => {
    it('debería autenticar al usuario y devolver un token JWT', async () => {
        const response = await request(app)
            .post('/usuarios/login')
            .send({
                email: 'ashley@gmail.com',
                password: '1234'
            });

        console.log(response.body);  // Verifica lo que devuelve la API

        expect(response.statusCode).toBe(200);  // Asegúrate de que sea 200, no 201
        expect(response.body).toHaveProperty('token');
        expect(response.body.usuario).toHaveProperty('email', 'ashley@gmail.com');  // Cambia "user" por "usuario"
    });

    it('debería devolver un error 401 con credenciales inválidas', async () => {
        const response = await request(app)
            .post('/usuarios/login')
            .send({
                email: 'ashley@gmail.com',
                password: 'hola123'
            });

        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty('error', 'Credenciales inválidas');
    });

    it('debería devolver un error 400 si faltan campos', async () => {
        const response = await request(app)
            .post('/usuarios/login')
            .send({
                email: 'ashley@gmail.com' 
                // Falta la contraseña
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Los campos email y password son requeridos');
    });
});


// 3. TESTS PARA OBTENER TODOS LOS PRODUCTOS
describe('GET /productos', () => {
    it('debería devolver todos los productos con un código de estado 200', async () => {
        const response = await request(app)
            .get('/productos')
            .query({ limit: 10, page: 1 });

        //console.log(response.body);  // Verifica lo que devuelve la API

        // Verificar que la respuesta tenga un código de estado 200
        expect(response.statusCode).toBe(200);

        // Verificar que el cuerpo de la respuesta tenga las propiedades correctas
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);

        // Verificar que cada producto tenga las propiedades necesarias
        expect(response.body.data[0]).toHaveProperty('id');
        expect(response.body.data[0]).toHaveProperty('titulo');
        expect(response.body.data[0]).toHaveProperty('descripcion');
        expect(response.body.data[0]).toHaveProperty('precio');
    });
});

// 4. TESTS PARA AÑADIR PRODUCTOS
describe('POST /productos', () => {
    it('debería crear un nuevo producto', async () => {
        const nuevoProducto = {
            titulo: 'Anillo de oro',
            descripcion: 'Anillo de oro con diamantes',
            precio: 500.00,
            categoria_id: 3, 
            vendedor_id:2  
        };

        const response = await request(app)
            .post('/productos')
            .send(nuevoProducto);

        // Verificar que el código de estado sea 201 (Creado)
        expect(response.statusCode).toBe(201);

        // Verificar que el producto creado tenga los campos correctos
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('titulo', nuevoProducto.titulo);
        expect(response.body).toHaveProperty('descripcion', nuevoProducto.descripcion);
        expect(parseFloat(response.body.precio)).toBe(nuevoProducto.precio);   //parseFloat convierte la respuesta a número para comparar
        expect(response.body).toHaveProperty('categoria_id', nuevoProducto.categoria_id);
        expect(response.body).toHaveProperty('vendedor_id', nuevoProducto.vendedor_id);
    });

    it('debería devolver un error si faltan datos obligatorios', async () => {
        const nuevoProducto = {
            titulo: 'Anillo de plata',
            precio: 300.00,
            // Faltan los campos 'descripcion', 'categoria_id', y 'vendedor_id'
        };

        const response = await request(app)
            .post('/productos')
            .send(nuevoProducto);

        // Verificar que el código de estado sea 400 (Bad Request)
        expect(response.statusCode).toBe(400);

        // Verificar que el error tenga el mensaje adecuado
        expect(response.body.error).toBe('Faltan datos obligatorios');
    });
});

