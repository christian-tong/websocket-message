//./src/middleware/authMiddleware.js
const { verifyToken } = require("../services/authService");

/**
 * Middleware para autenticar solicitudes basadas en un token JWT.
 * Verifica si el token es válido y lo adjunta al objeto de solicitud.
 * @param {Object} req - Objeto de solicitud (contiene el encabezado de autorización con el token).
 * @param {Object} res - Objeto de respuesta (devuelve un error si el token no es válido).
 * @param {Function} next - Función de siguiente middleware (pasa al siguiente paso si el token es válido).
 */
const authenticate = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    // Verificamos el token y extraemos la información del usuario
    const decoded = verifyToken(token.replace("Bearer ", ""));
    req.userId = decoded.userId; // Almacenamos el userId en la solicitud para usarlo en los siguientes middlewares o controladores
    next(); // Continuamos al siguiente middleware
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

module.exports = authenticate;
