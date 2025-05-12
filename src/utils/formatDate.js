//./src/utils/formatDate.js
const getFormattedTimestamp = () => {
  const ahoraUTC = new Date();
  const offsetPeru = -5 * 60 * 60 * 1000;
  const fechaPeru = new Date(ahoraUTC.getTime() + offsetPeru);

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
  ].join("-");
};

module.exports = getFormattedTimestamp;
