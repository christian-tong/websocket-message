//./src/utils/hashUtils.js
const crypto = require("crypto");
const { pbkdf2Sync } = require("pbkdf2");

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 600000, 32, "sha256").toString("hex");
  return { salt, hash };
};

const verifyPassword = (password, storedPassword) => {
  const [algorithm, iterations, salt, hash] = storedPassword.split("$");
  if (algorithm !== "pbkdf2_sha256") {
    throw new Error("Algoritmo de contraseña no compatible");
  }

  const derivedHash = pbkdf2Sync(
    password,
    salt,
    parseInt(iterations),
    32,
    "sha256"
  ).toString("hex");

  return derivedHash === hash;
};

module.exports = { hashPassword, verifyPassword };
