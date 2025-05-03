const { login } = require("../services/authService");

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }
    const { token } = await login(username, password); // Llama al servicio de login
    res.status(200).json({ message: "Autenticación correcta", token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

module.exports = { loginUser }; // Correctamente exportamos loginUser
