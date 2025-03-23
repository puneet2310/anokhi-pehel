const multer = require("multer");

const paperStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./papers/"); // Save files in the "papers" directory
  },
  filename: function (req, file, cb) {
    cb(null, "Test_" + Date.now()); // Unique filename
  },
});

const paperUpload = multer({ storage: paperStorage });

module.exports = { paperUpload };
