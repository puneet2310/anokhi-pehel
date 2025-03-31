const express = require("express");
const Student = require("../models/Student");
const Test = require("../models/TestScore");
const router = express.Router();
const cors = require("cors");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const app = express();
const {
  getStudentsFromLastAttendance,
  promoteStudent,
  changeStatus,
} = require("../controller/studentController");

app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + "-" + Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

let upload = multer({ storage, fileFilter });
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

router.route("/addStudent").post(upload.single("photo"), async (req, res) => {
  const name = req.body.name;
  const className = req.body.class;
  const phone = req.body.phone;
  const location = req.body.location;
  const mode = req.body.mode;
  const dob = req.body.dob;
  const aadhar = req.body.aadhar;
  const address = req.body.address;
  const school = req.body.school;
  const photo = req.file.filename;

  try {
    // Check if student with the same Aadhar number already exists
    const existingStudent = await Student.findOne({ aadhar: aadhar });
    if (existingStudent) {
      return res.json("Student with this Aadhar number already exists");
    }

    const newStudentData = {
      name,
      className,
      phone,
      location,
      mode,
      dob,
      aadhar,
      address,
      school,
      photo,
    };

    const newStudent = new Student(newStudentData);

    await newStudent.save();
    res.json("Student Added");
  } catch (error) {
    // console.error(error);
    res.json("ALL INPUT IS NOT FILLED");
  }
});

router.get("/studentList", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});



router.get("/getstudentByUserId", async (req, res) => {
  // Extract the user ID from the request query parameters
  const student_id = req.query.studentid;

  try {
    // Query the database to retrieve the user based on the ID
    const student = await Student.findById(student_id);
    // Check if the user exists
    if (!student) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getMarksByUserId", async (req, res) => {
  try {
    const studentId = req.query.studentid;
    const marks = await Test.find({ "score.studentId": studentId });

    if (marks && marks.length > 0) {
      res.json(marks);
    } else {
      res.json({ message: "Data not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/students", async (req, res) => {
  try {
    const selectedClass = req.query.class; // Get the selected class from the query parameters

    // Query the database to find students by the className
    const students = await Student.find({ className: selectedClass });

    res.json(students); // Send the list of students as a JSON response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/getStudentByUserId", async (req, res) => {
  // Extract the user ID from the request query parameters
  try {
    // Extract the studentIds from the request body
    const { studentIds } = req.body;

    // Query the database to retrieve student names based on IDs
    const students = await Student.find({ _id: { $in: studentIds } });

    // Extract student names from the retrieved data
    const studentNames = students.map((student) => ({
      _id: student._id,
      name: student.name,
    }));

    res.json(studentNames);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Route to update student details by ID
router.put("/updateStudent", async (req, res) => {
  try {
    const id = req.body._id;
    const updatedStudent = await Student.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(updatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/deleteStudents/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the student by ID and delete it
    const deletedStudent = await Student.findOneAndDelete({ _id: id });

    if (deletedStudent) {
      // If the student was found and deleted, send a success message
      res
        .status(200)
        .json({ message: "Student deleted successfully", deletedStudent });
    } else {
      // If no student was found with the provided ID, send a 404 error
      res.status(404).json({ error: "Student not found" });
    }
  } catch (error) {
    // If an error occurs during the deletion process, send a 500 error
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/studentTable", getStudentsFromLastAttendance); //Route to get students details of any class for a particular month
router.put("/promoteStudent/:id", promoteStudent);  //Route to promote the students
router.put("/updateStudentStatus/:id", changeStatus); //Route to update student status(active or inactive)
module.exports = router;
