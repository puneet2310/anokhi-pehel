const express = require("express");
const router = express.Router();
const { paperUpload } = require("../middlewares/multer.middlewares.js");
const { 
  submitScore,
  testData, 
  graphData, 
  averageData, 
  testsScore 
} = require("../controller/performanceController.js");

router.post("/submitScore", paperUpload.single("file"), submitScore);

router.get("/tests", testData);

router.get("/get-graph", graphData);

router.get("/getAverage", averageData)

router.get("/testsScore", testsScore);

module.exports = router;
