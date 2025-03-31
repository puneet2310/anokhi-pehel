const mongoose = require("mongoose");
const Student = require("../models/Student");
const Test = require("../models/TestScore"); 
const {authorize, uploadFile} = require('../utils/googleConfig.js')
const fs = require("fs");
const { deleteFile } = require("../utils/fileUtils.js");

const submitScore = async (req, res) => {
  let uploadedFilePath = req?.file?.path;
  try {
      const { classId, subject, date, scores, mentorId, totalMarks } = req.body;
      if (!classId) {
          deleteFile(uploadedFilePath);
          return res.status(401).json({ error: "classId is required" });
      }
      if (!subject) {
          deleteFile(uploadedFilePath);
          return res.status(401).json({ error: "subject is required" });
      }
      if (!date) {
          deleteFile(uploadedFilePath);
          return res.status(401).json({ error: "date is required" });
      }
      if (!scores) {
          deleteFile();
          return res.status(401).json({ error: "scores is required" });
      }
      if (!mentorId) {
          deleteFile(uploadedFilePath);
          return res.status(401).json({ error: "mentorId is required" });
      }
      if (!req.file) {
          return res.status(401).json({ error: "file is required" });
      }

      let parsedScores;
      try {
          parsedScores = JSON.parse(scores);
      } catch (error) {
          console.error("Error parsing scores:", error);
          deleteFile(uploadedFilePath);
          return res.status(400).json({ error: "Invalid scores format" });
      }

      if (!Array.isArray(parsedScores) || parsedScores.length === 0) {
          deleteFile(uploadedFilePath);
          return res.status(400).json({ error: "Scores array must not be empty" });
      }

      for (const score of parsedScores) {
          if (!score.studentId || typeof score.score !== "number") {
              deleteFile(uploadedFilePath);
              return res.status(403).json({ error: "Invalid score data" });
          }
      }

      // **CHECK IF DATA ALREADY EXISTS BEFORE FILE UPLOAD**
      for (const score of parsedScores) {
          const { studentId } = score;

          let testRecord = await Test.findOne({ student: studentId, subject, className: classId });

          if (testRecord) {
              const existingTest = testRecord.tests.find(
                  (test) => new Date(test.date).toISOString().split("T")[0] === new Date(date).toISOString().split("T")[0]
              );

              if (existingTest) {
                  deleteFile(uploadedFilePath);
                  return res.status(409).json({
                      message: `Data already exists for current date and subject`,
                  });
              }
          }
      }

      let fileId = null;
      if (req.file) {
          if (
              req.file.mimetype !== "application/pdf" &&
              req.file.mimetype !== "application/msword" &&
              req.file.mimetype !==
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ) {
              deleteFile(uploadedFilePath);
              return res.status(400).json({ error: "Only PDF or Word files are allowed!" });
          }
          const authClient = await authorize();
          const uploadedFileUrl = await uploadFile(authClient, req.file, classId, subject, date);
          fileId = uploadedFileUrl;
      }

      for (const score of parsedScores) {
          const { studentId, score: studentScore } = score;
          let testRecord = await Test.findOne({ student: studentId, subject, className: classId });

          if (testRecord) { 
              testRecord.tests.push({ totalMarks: totalMarks, score: studentScore, mentorId: mentorId, fileId: fileId, date: date });
              await testRecord.save();
          } else {
              const newTest = new Test({
                  student: studentId,
                  className: classId,
                  subject,
                  tests: [{ totalMarks: totalMarks, score: studentScore, mentorId: mentorId, fileId: fileId, date: date }],
              });
              await newTest.save();
          }
      }

      return res.status(200).json({ message: "Scores submitted successfully !!" });
  } 
  catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: error.message || "Internal Server Error" });
  } 
  finally {
      deleteFile(uploadedFilePath); // Ensure file is deleted no matter what
  }
};


const testData = async (req, res) => {
  try {
    const { selectedClass, subject } = req.query;
    // Fetch all students because may be some student get promoted to next class and in the prev class remainig students have the test
    const testRecord = await Test.find({ className: selectedClass, subject: subject })
      .select("tests")
      .lean();

    if (!testRecord || testRecord.length === 0) {
      return res.status(404).json({ message: "No tests found for the given class and subject" });
    }

    const testDates = [];
    const dateSet = new Set(); // To store unique dates

    testRecord.forEach(record => {
      record.tests.forEach(test => {
        const testDateStr = new Date(test.date).toISOString(); // Convert to a standard format

        if (!dateSet.has(testDateStr)) {
          dateSet.add(testDateStr);
          testDates.push({ date: test.date, id: test._id });
        }
      });
    });

    // console.log("Test Dates:", testDates);

    return res.status(200).json(testDates);
  } catch (error) {
    console.error("Error fetching test dates:", error);
    return res.status(500).json({ message: "Error fetching test dates", error });
  }
}

const graphData = async (req, res) => {
  let { studentId, subjectId, classId } = req.query;

  // console.log("Received Query:", { studentId, subjectId });

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ error: "Invalid studentId format" });
  }

  try {
    const performance = await Test.findOne({
      student: new mongoose.Types.ObjectId(studentId),
      subject: subjectId,
      className: classId
    })
      .select("tests")
      .lean();

    // console.log("Found Performance:", performance);

    if (!performance) {
      return res.status(404).json({ message: "No performance data found for this student and subject." });
    }

    const formattedTests = performance.tests.map(test => ({
      score: test.score*(100/test.totalMarks),
      date: new Date(test.date).toISOString().split("T")[0],
    }));

    // console.log("Formatted Tests:", formattedTests);

    res.status(200).json({ status: 200, data: formattedTests, message: "Performance data retrieved successfully" });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

const averageData = async(req, res) => {
  const { classId, subjectId } = req.query;

  const classData = await Test.find({ className: classId , subject: subjectId });
  if (!classData) {
    return res.status(404).json({ success: false, message: "Class not found" });
  }

  const performanceByDate = {};

  classData.forEach((entry) => {
      entry.tests.forEach((test) => {
          if (!test.date || typeof test.score !== "number") {
              console.warn("Skipping test with invalid data:", test);
              return;
          }

          const dateKey = new Date(test.date).toISOString().split("T")[0]; // Ensure consistent date format

          if (!performanceByDate[dateKey]) {
              performanceByDate[dateKey] = { sum: 0, count: 0 };
          }

          if(test.score > -1){
            performanceByDate[dateKey].sum += test.score*(100/test.totalMarks);
            performanceByDate[dateKey].count += 1;
          }
            
      });
  });

  // console.log("performanceByDate: ", performanceByDate)

  const averagePerformance = Object.entries(performanceByDate).map(([date, data]) => ({
    date, // Now formatted as YYYY-MM-DD
    score: data.sum / data.count,  
  }));

  // console.log("averagePerformance: ", averagePerformance)

  return res.json({ success: true, data: averagePerformance });
}

const testsScore = async (req, res) => {
  try {
    const { testDate } = req.query; // Get the test date from the request query

    if (!testDate) {
      return res.status(400).json({ error: "Test date is required" });
    }

    
    const results = await Test.find({ "tests.date": testDate })
      .populate("student", "name") 


    if (!results.length) {
      return res.status(404).json({ message: "No test scores found for the given date" });
    }

    // Format response to include only the required details
    const response = results.map((test) => ({
      studentId: test.student._id,
      studentName: test.student.name,
      subject: test.subject,
      className: test.className,
      scores: test.tests
      .filter((t) => {
        const recordDate = new Date(t.date).toISOString().split("T")[0]; // Convert to 'YYYY-MM-DD'
        const queryDate = new Date(testDate).toISOString().split("T")[0]; // Ensure same format
        return recordDate === queryDate;
      })
      .map((t) => ({
        score: t.score,
        totalMarks: t.totalMarks,
        mentorId: t.mentorId,
        paperLink: t.fileId,
        date: t.date,
      })),

    }));

    // console.log("Response: ", response);

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching test scores:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
module.exports = { 
    submitScore, 
    testData,
    graphData, 
    averageData,
    testsScore 
};
