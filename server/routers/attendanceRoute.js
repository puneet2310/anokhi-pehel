const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const moment = require("moment");
const { monthlyAttendance, lastFiveDaysAttendance } = require("../controller/attendanceController");

router.post("/submitAttendance", async (req, res) => {
  try {
    const { classId, date, mentorId, attendanceRecords } = req.body;

    // Convert the input date to a string in the format "yyyy-MM-dd"
    const dateString = new Date(date).toISOString().split("T")[0];

    // Find existing attendance records for the class and date
    const existingAttendance = await Attendance.findOne({
      classId,
      date: {
        $gte: new Date(dateString), // Greater than or equal to the input date
        $lt: new Date(
          new Date(dateString).setDate(new Date(dateString).getDate() + 1)
        ), // Less than the next day
      },
    });

    if (existingAttendance) {
      // Update attendance records
      const updatedRecords = attendanceRecords.map((newRecord) => {
        const existingRecord = existingAttendance.attendance.find(
          (record) => record.studentId === newRecord.studentId
        );

        if (existingRecord) {
          // Update existing record's status
          existingRecord.status = newRecord.status;
          return existingRecord;
        } else {
          // Add new record if not found
          return {
            studentId: newRecord.studentId,
            status: newRecord.status,
          };
        }
      });

      // Remove records for students no longer in attendanceRecords
      existingAttendance.attendance = updatedRecords.filter((record) =>
        attendanceRecords.some(
          (newRecord) => newRecord.studentId === record.studentId
        )
      );

      await existingAttendance.save();

      return res.json("Attendance updated successfully");
    }

    // If no existing attendance is found, create a new record
    const newAttendance = new Attendance({
      classId,
      date: new Date(dateString),
      mentorId,
      attendance: attendanceRecords.map((record) => ({
        studentId: record.studentId,
        status: record.status,
      })),
    });

    await newAttendance.save();

    res.json("Attendance submitted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/attendance", async (req, res) => {
  const { classId } = req.query;
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  // console.log("vivek");
  try {
    // Find attendance records for the given classId and today's date
    const attendanceRecords = await Attendance.find({
      classId,
      date: { $gte: new Date(today), $lt: new Date(today + "T23:59:59.999Z") },
    });

    if (attendanceRecords.length > 0) {
      // Calculate total students and total present students
      let totalStudents = 0;
      let totalPresentStudents = 0;

      attendanceRecords.forEach((record) => {
        totalStudents += record.attendance.length; // Increment total students by the attendance count
        totalPresentStudents += record.attendance.filter(
          (item) => item.status === "present"
        ).length; // Count present students
      });

      res.status(200).json({
        totalStudents,
        totalPresentStudents,
      });
    } else {
      res.status(404).json({
        error:
          "Attendance data not found for the given classId and today's date",
      });
    }
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/attendanceTotal", async (req, res) => {
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  try {
    // Find attendance records for the given classId and today's date
    const attendanceRecords = await Attendance.find({
      date: { $gte: new Date(today), $lt: new Date(today + "T23:59:59.999Z") },
    });

    if (attendanceRecords.length > 0) {
      // Calculate total students and total present students
      let totalStudents = 0;
      let totalPresentStudents = 0;

      attendanceRecords.forEach((record) => {
        totalStudents += record.attendance.length; // Increment total students by the attendance count
        totalPresentStudents += record.attendance.filter(
          (item) => item.status === "present"
        ).length; // Count present students
      });

      res.status(200).json({
        totalStudents,
        totalPresentStudents,
      });
    } else {
      res.status(404).json({
        error:
          "Attendance data not found for the given classId and today's date",
      });
    }
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/totalAttendance", async (req, res) => {
  const { classId, date } = req.query;

  try {
    // Fetch attendance data based on classId and date
    const attendanceData = await Attendance.find({
      classId,
      date: { $gte: new Date(date), $lt: new Date(date + "T23:59:59.999Z") },
    });

    res.status(200).json({ students: attendanceData });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/lastFiveDaysAttendance", lastFiveDaysAttendance); //Route to get last five days attendance for any class

router.get("/monthTotalAttendance", monthlyAttendance); //Route to get monthly attendance for any class for a particular month

module.exports = router;
