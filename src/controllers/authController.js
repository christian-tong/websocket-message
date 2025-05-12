//./src/controllers/authController.js
const { login, register } = require("../services/authService");
const { io, activeConnections } = require("../socket-io/socketIo");

// Controlador para el registro de usuario
const registerUser = async (req, res) => {
  try {
    // Validamos los datos de entrada
    const { username, password } = req.body;

    // Comprobamos si los campos están presentes
    if (!username || !password) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    // Llamamos al servicio de registro
    const user = await register(username, password);

    // Respondemos con el usuario creado
    res.status(201).json({
      message: "Usuario registrado con éxito",
      user: { username: user.username }, // Solo devolvemos el username por razones de seguridad
    });
  } catch (error) {
    // Manejo de errores
    res.status(500).json({ error: error.message });
  }
};

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

module.exports = { loginUser, registerUser }; // Correctamente exportamos loginUser
