const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  login,
  getUserData,
  forgotPassword,
  resetPassword,
} = require("../controller/authController");

const cors = require("cors");

router.use(cors());

router.post(
  "/login",
  [
    body("email", "Enter a Valid Email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  login
);

router.get("/userData", getUserData);

router.post("/forgot-password", forgotPassword);

router.get("/reset-password/:id/:token", resetPassword);


module.exports = router;
