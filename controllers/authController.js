const { register, login } = require("../services/authService");

const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }
    const result = await register(username, password);
    res
      .status(201)
      .json({ message: "Usuario registrado exitosamente", data: result });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al registrar el usuario", details: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }
    const result = await login(username, password);
    res.status(200).json({ message: "Autenticación correcta", data: result });
  } catch (error) {
    res.status(401).json({ error: "Credenciales incorrectas" });
  }
};

module.exports = { registerUser, loginUser };
