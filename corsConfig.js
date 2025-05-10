require("dotenv").config();

const allowedOrigins = [
  process.env.MODA_URL, 
  process.env.NOTIFICATION_URL, 
  ];
  
  module.exports = allowedOrigins;
  