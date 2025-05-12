//./src/services/authService.js
const jwt = require("jsonwebtoken");
const { getConnection } = require("../config/dbConfig");
const { hashPassword, verifyPassword } = require("../utils/hashUtils");

const JWT_SECRET = process.env.SECRET_KEY;

/**
 * Genera un token JWT para un usuario dado.
 * @param {string} userId - El ID del usuario para generar el token.
 * @returns {string} - El token JWT generado.
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
};

/**
 * Registra un nuevo usuario en la base de datos.
 * @param {string} username - El nombre de usuario para registrar.
 * @param {string} password - La contraseña del usuario, que será hasheada antes de guardarla.
 * @returns {Object} - Un objeto con el username del usuario registrado.
 */
const register = async (username, password) => {
  const connection = await getConnection();

  const { salt, hash } = hashPassword(password); // Hash de la contraseña

  const query = "INSERT INTO users (username, password) VALUES (?, ?)";
  await connection.execute(query, [
    username,
    `pbkdf2_sha256$600000$${salt}$${hash}`,
  ]);

  return { username };
};

/**
 * Inicia sesión de un usuario, validando su contraseña y generando un token JWT.
 * @param {string} username - El nombre de usuario para el login.
 * @param {string} password - La contraseña del usuario.
 * @returns {Object} - Un objeto con el token JWT, userId y el username del usuario.
 */
const login = async (username, password) => {
  const connection = await getConnection();

  const query =
    "SELECT id, username, password FROM users WHERE username = ? LIMIT 1";
  const [rows] = await connection.execute(query, [username]);

  if (rows.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  const { id, username: userNameFromDb, password: passwordHash } = rows[0];

  const isValid = verifyPassword(password, passwordHash); // Verificar la contraseña
  if (!isValid) {
    throw new Error("Contraseña incorrecta");
  }

  const token = generateToken(id); // Generar token
  return { token, userId: id, username: userNameFromDb };
};

/**
 * Verifica un token JWT.
 * @param {string} token - El token JWT a verificar.
 * @returns {Object} - El objeto decodificado del token.
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Token inválido o expirado");
  }
};

module.exports = { register, login, verifyToken };
