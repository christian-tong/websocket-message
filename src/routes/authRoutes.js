//./src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { loginUser, registerUser } = require("../controllers/authController"); // Importamos las funciones de los controladores

/**
 * Ruta para realizar el login de un usuario.
 * @route POST /api/auth/login
 * @param {Object} req - Objeto de solicitud (contiene las credenciales del usuario).
 * @param {Object} res - Objeto de respuesta (contiene el token y el username si el login es exitoso).
 */
router.post("/login", loginUser);

/**
 * Ruta para registrar un nuevo usuario.
 * @route POST /api/auth/register
 * @param {Object} req - Objeto de solicitud (contiene el nombre de usuario y la contraseña).
 * @param {Object} res - Objeto de respuesta (contiene un mensaje de éxito y el username registrado).
 */
router.post("/register", registerUser); // Ruta para registrar usuarios

/**
 * Ruta para verificar si el token JWT es válido.
 * @route GET /api/auth/verify
 * @param {Object} req - Objeto de solicitud (contiene el token JWT en el encabezado de autorización).
 * @param {Object} res - Objeto de respuesta (responde con 200 si el token es válido).
 */
router.get("/verify", (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Extrae el token del encabezado
    verifyToken(token); // Verifica el token
    res.sendStatus(200); // Responde con un 200 si el token es válido
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
});

module.exports = router;
