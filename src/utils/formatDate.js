//./src/utils/formatDate.js
/**
 * Genera un timestamp formateado en la zona horaria de Perú (UTC-5).
 * @returns {string} - Un string con el formato "DD/MM/YYYY-HH:MM:SS:MS" (fecha y hora con milisegundos).
 */
const getFormattedTimestamp = () => {
  const ahoraUTC = new Date();
  const offsetPeru = -5 * 60 * 60 * 1000; // Offset para la zona horaria de Perú (UTC-5)
  const fechaPeru = new Date(ahoraUTC.getTime() + offsetPeru); // Ajustamos la hora a Perú

  // Formateamos la fecha y la hora
  return [
    [
      fechaPeru.getUTCDate().toString().padStart(2, "0"),
      (fechaPeru.getUTCMonth() + 1).toString().padStart(2, "0"),
      fechaPeru.getUTCFullYear(),
    ].join("/"),
    [
      fechaPeru.getUTCHours().toString().padStart(2, "0"),
      fechaPeru.getUTCMinutes().toString().padStart(2, "0"),
      fechaPeru.getUTCSeconds().toString().padStart(2, "0"),
      ahoraUTC.getUTCMilliseconds().toString().padStart(4, "0"),
    ].join(":"),
  ].join("-"); // Combinamos la fecha y la hora
};

module.exports = getFormattedTimestamp;
