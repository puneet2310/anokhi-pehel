const express = require("express");
const router = express.Router();
const { sendMailsFromSheet } = require("../controller/email.controller.js");
const verifyUser = require("../middlewares/auth.middlewares.js");
router.post("/send-mail", verifyUser, sendMailsFromSheet);
module.exports = router;