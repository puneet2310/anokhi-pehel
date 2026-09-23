const moment = require("moment");
const Attendance = require("../models/Attendance");

// Get monthly attendance for any class for a particular month
const monthlyAttendance = async (req, res) => {
  // Extracting classId and month from the request query
  const { classId, month } = req.query;

  try {
    // Calculating the start and end dates of the month
    const startOfMonth = moment(month, "YYYY-MM").startOf("month").toDate();
    const endOfMonth = moment(month, "YYYY-MM").endOf("month").toDate();

    // Querying the database to find attendance data for the specified class and month
    const attendanceData = await Attendance.find({
      classId,
      date: { $gte: startOfMonth, $lte: endOfMonth }, // Filtering by date range
    });

    // Sending the attendance data as JSON response
    res.status(200).json({ students: attendanceData });
  } catch (error) {
    // Handling any errors that occur during the process
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const lastFiveDaysAttendance = async(req, res) => {
  try {
    const { classId } = req.query;

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 4);

    const attendanceRecords = await Attendance.find({
      classId,
      date: { $gte: fiveDaysAgo, $lte: today }
    }).sort({ date: -1 });

    const result = {};

    const studentIds = [...new Set(
      attendanceRecords.flatMap(record =>
        record.attendance.map(item => item.studentId)
      )
    )];

    // Generate date strings for display (DD/MM)
    const dateStrings = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (4 - i)); // Fixed to show last 5 days in order
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });

    // Build response
    studentIds.forEach(studentId => {
      result[studentId] = dateStrings.map(dateStr => {
        const record = attendanceRecords.find(r => {
          const rd = new Date(r.date);
          return `${rd.getDate()}/${rd.getMonth() + 1}` === dateStr &&
            r.attendance.some(a => a.studentId === studentId);
        });

        if (record) {
          const attendance = record.attendance.find(a => a.studentId === studentId);
          return {
            date: dateStr,
            status: attendance.status,
            marked: true // Flag indicating this was actually marked, this will be used in the frontend to show the status of data available for current date
          };
        } else {
          return {
            date: dateStr,
            status: null, // No data available
            marked: false
          };
        }
      });
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAttendance = async (req, res) => {
  const { classId, date } = req.query;
  const targetDate = date
    ? (typeof date === "string" && date.includes("T") ? date.split("T")[0] : date)
    : new Date().toISOString().split("T")[0];

  try {
    // Find attendance records for the given classId and target date
    const attendanceRecords = await Attendance.find({
      classId,
      date: {
        $gte: new Date(targetDate),
        $lt: new Date(targetDate + "T23:59:59.999Z"),
      },
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
          "Attendance data not found for the given classId and date",
      });
    }
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAttendanceTotal = async (req, res) => {
  const { date } = req.query;
  const targetDate = date
    ? (typeof date === "string" && date.includes("T") ? date.split("T")[0] : date)
    : new Date().toISOString().split("T")[0];

  try {
    // Find attendance records for the target date
    const attendanceRecords = await Attendance.find({
      date: {
        $gte: new Date(targetDate),
        $lt: new Date(targetDate + "T23:59:59.999Z"),
      },
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
};

module.exports = {
  monthlyAttendance,
  lastFiveDaysAttendance,
  getAttendance,
  getAttendanceTotal,
};
