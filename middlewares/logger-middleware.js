// Middleware para loguear las solicitudes
const logRequest = (req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url} at ${new Date().toISOString()}`);
    console.log(`Query params: ${JSON.stringify(req.query)}`);
    next();
};

module.exports = logRequest;
