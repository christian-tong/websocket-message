const { getConnection } = require("../config/dbConfig");
const { hashPassword, verifyPassword } = require("../utils/hashUtils");

const register = async (username, password) => {
  const connection = await getConnection();

  // Generar un hash de la contraseña
  const { salt, hash } = hashPassword(password);

  // Insertar el usuario en la base de datos
  const query = "INSERT INTO users (username, password) VALUES (?, ?)";
  await connection.execute(query, [
    `${username}`,
    `pbkdf2_sha256$600000$${salt}$${hash}`,
  ]);

  return { username };
};

const login = async (username, password) => {
  const connection = await getConnection();

  // Obtener la contraseña hasheada de la base de datos
  const query = "SELECT password FROM users WHERE username = ? LIMIT 1";
  const [rows] = await connection.execute(query, [username]);

  if (rows.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  const passwordHash = rows[0].password;

  // Verificar la contraseña
  const isValid = verifyPassword(password, passwordHash);
  if (!isValid) {
    throw new Error("Contraseña incorrecta");
  }

  return { username };
};

module.exports = { register, login };
