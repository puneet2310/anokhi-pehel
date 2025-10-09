const express = require("express");
const router = express.Router();
const { sendMailsFromSheet } = require("../controller/email.controller.js");

router.post("/send-mail", sendMailsFromSheet);
module.exports = router;