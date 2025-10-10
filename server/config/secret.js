const jwt = require("jsonwebtoken");
const JWT_KEY = "HaHa";

const generateToken = (userId) => {
  return jwt.sign({ user: { id: userId } }, JWT_KEY);
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_KEY);
};

//function to generate a temporary token valid for only 30 minutes
const generateTempToken = (userId) => {
  return jwt.sign({ user: { id: userId } }, JWT_KEY, { expiresIn: "30m" });
};

module.exports = { generateToken, verifyToken, generateTempToken, JWT_KEY };
