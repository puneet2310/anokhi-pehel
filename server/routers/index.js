const express = require("express");
const router = express.Router();

router.use(require("./authRoute"));
router.use(require("./studentRoute"));
router.use(require("./addUserRoute"));
router.use(require("./addScoreRoute"));
router.use(require("./lineScheduleRoute"));
router.use(require("./classScheduleRoute"));
router.use(require("./attendanceRoute"));
router.use(require("./topicRoute"));
router.use(require("./AdmissionRoute"));
router.use(require("./antyodayaRoute"));
router.use(require("./issue"));
router.use(require("./settingsRoute"));
router.use(require("./email.route"));
module.exports = router;
