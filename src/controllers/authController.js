//./src/controllers/authController.js
const { login, register } = require("../services/authService");
const { io, activeConnections } = require("../socket-io/socketIo");

/**
 * Controlador para el registro de un nuevo usuario.
 * @param {Object} req - Objeto de solicitud (contiene los datos de registro).
 * @param {Object} res - Objeto de respuesta (se devuelve el resultado de la operación).
 */
const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    const user = await register(username, password);

    // Devolvemos solo el username por seguridad
    res.status(201).json({
      message: "Usuario registrado con éxito",
      user: { username: user.username },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Controlador para el login de un usuario.
 * @param {Object} req - Objeto de solicitud (contiene las credenciales del usuario).
 * @param {Object} res - Objeto de respuesta (contiene el token y la respuesta de autenticación).
 */
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    const {
      token,
      userId,
      username: userNameFromDb,
    } = await login(username, password);

    if (activeConnections.has(userId)) {
      activeConnections.get(userId).disconnect(true);
    }

    res.status(200).json({
      message: "Autenticación correcta",
      token,
      username: userNameFromDb,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

module.exports = { loginUser, registerUser };
