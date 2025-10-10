const jwt = require("jsonwebtoken");
const { JWT_KEY } = require("../config/secret");

const verifyUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, JWT_KEY);
    req.user = decoded; 
    next();
  } catch (err) {
    console.error("Token Verification Failed:", err.message);
    return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
  }
};

module.exports = verifyUser;
