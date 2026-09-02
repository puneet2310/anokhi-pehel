import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { classes, months } from "../../constants/Dashboard";
import { BASE_URL } from "../../../src/Service/helper";
import { downloadPDF } from "../../../src/Service/utilityfunctions";
import { useSelector } from "react-redux";
import moment from "moment";
import { FaCheck, FaTimes } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import StudentProfileModal from "../../Modals/studentProfileModal";

const Attendance = () => {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.user);

  const [credentials, setCredentials] = useState({
    class: "",
    month: "",
  });

  const [status, setStatus] = useState("True");
  const [students, setStudents] = useState([]);
  const [studentsAttendance, setStudentsAttendance] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [selectedStudent, setSelectedStudent] = useState(null); // State for selected student

  useEffect(() => {
    if (credentials.class || credentials.month) {
      fetchAttendanceData(credentials.class);
    }
  }, [credentials]);

  const fetchAttendanceData = async (value) => {
    try {
      if (credentials.class && credentials.month) {
        const response = await axios.get(`${BASE_URL}/monthTotalAttendance`, {
          params: {
            classId: credentials.class,
            month: credentials.month,
          },
        });
        if (response.status === 200 && response.data.students.length > 0) {
          const completeAttendance = response.data;
          if (completeAttendance) {
            setStudentsAttendance(completeAttendance);
            fetchStudents(completeAttendance.students);
            setStatus("True");
          } else {
            setStatus("False");
            console.error("Attendance data structure invalid");
          }
        } else {
          setStatus("False");
          console.error("No attendance data or invalid response");
        }
      }
    } catch (error) {
      setStatus("False");
      console.error("Error fetching attendance data:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAttendanceData();
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    if (name === "class" || name === "month") {
      fetchAttendanceData(value);
    }
  };

  const fetchStudents = (value) => {
    axios
      .post(`${BASE_URL}/studentTable`, {
        value: value,
      })
      .then((response) => {
        // Sort students by name in alphabetical order
        const sortedStudents = response.data.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });

        // Set the sorted students data in state
        console.log("Sorted students data:", sortedStudents);
        setStudents(sortedStudents);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
      });
  };

  const getAttendanceForStudent = (studentId, day) => {
    if (!studentsAttendance || !studentsAttendance.students) {
      return "";
    }
    const attendanceRecord = studentsAttendance.students
      .find((student) => moment(student.date).date() === day)
      ?.attendance.find((att) => att.studentId === studentId);

    return attendanceRecord ? attendanceRecord.status : "";
  };

  const openModal = (student) => {
    console.log("Opening modal with student data:", student);
    setSelectedStudent(student); // Set the selected student
    setIsModalOpen(true); // Open the modal
  };

  const month = `${
    months.find((m) => m.value === credentials.month.split("-")[1])?.label
  } ${credentials.month.split("-")[0]}`;
  const generatePDF = () => {
    // Initialize jsPDF
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Define the columns and rows
    const columns = ["Student Name"];
    const daysInMonth = moment(credentials.month, "YYYY-MM").daysInMonth();
    for (let i = 1; i <= daysInMonth; i++) {
      columns.push(i);
    }
    columns.push("Total");

    const rows = students.map((student) => {
      let presentCount = 0;
      const row = [student.name];
      for (let i = 1; i <= daysInMonth; i++) {
        const attendanceStatus = getAttendanceForStudent(student._id, i);
        if (attendanceStatus === "present") presentCount++;
        row.push(
          attendanceStatus === "present"
            ? "P"
            : attendanceStatus === "absent"
            ? "A"
            : ""
        );
      }
      row.push(presentCount);
      return row;
    });

    // Add the title
    const title = `Attendance for Class ${credentials.class} in ${month}`;
    doc.text(title, 14, 20);

    // Add the table to the PDF
    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 30,
      styles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Adjust width for the first column (Student Name)
        // Adjust other columns if needed
      },
      theme: "grid",
      margin: { top: 30, left: 10, right: 10 },
    });

    // Save the PDF
    doc.save(`Attendance-Class ${credentials.class}-${month}`);
  };
  return (
    <DashboardLayout>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="space-y-8">
            <div className="border-b border-gray-900/10 pb-8">
              <h2 className="text-base font-bold leading-7 text-gray-900">
                View Attendance
              </h2>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-2 sm:col-start-1">
                  <label
                    htmlFor="month"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Month
                  </label>
                  <div className="mt-2">
                    <input
                      type="month"
                      name="month"
                      id="month"
                      value={credentials.month}
                      onChange={onChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="region"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Class
                  </label>
                  <div className="mt-2">
                    <select
                      name="class"
                      id="class"
                      value={credentials.class}
                      onChange={onChange}
                      placeholder="Class"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                    >
                      <option value="">Select a class</option>
                      {classes.map((item, index) => (
                        <option key={index} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {status === "False" && (
            <div className="text-black text-center p-4 text-lg font-bold">
              No attendance record found.
            </div>
          )}
          {status === "True" && (
            <div className="overflow-x-auto">
              <div className="shadow-md sm:rounded-lg">
                <h2 className="text-lg font-semibold mb-4 sticky top-0 bg-white z-20">
                  Attendance for Class {credentials.class} in {month}
                </h2>
                <button
                  onClick={generatePDF}
                  className="mb-4 p-2 bg-blue-500 text-white rounded"
                >
                  Download as PDF
                </button>
                <div className="overflow-y-auto max-h-96 md:max-h-screen">
                  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 ">
                    <thead className="text-xs  uppercase bg-gray-800 text-white sticky top-0 z-20">
                      <tr>
                        <th className="py-3 px-4 sticky left-0 bg-gray-800 z-20">
                          Student Name
                        </th>
                        {/* Generate table headers for each day of the month */}
                        {Array.from({
                          length: moment(
                            credentials.month,
                            "YYYY-MM"
                          ).daysInMonth(),
                        }).map((_, index) => (
                          <th key={index} className="py-3 px-4">
                            {index + 1} {/* Day number */}
                          </th>
                        ))}
                        <th className="py-3 px-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        console.log("Student data:", student);
                        let presentCount = 0;
                        return (
                          <tr
                            key={student._id}
                            className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800  dark:border-gray-700"
                          >
                            <td
                              className="py-2 px-4 sticky left-0 bg-gray-800 text-white z-10 cursor-pointer"
                              onClick={() => openModal(student)} // Open modal on student name click
                            >
                              {student.name}
                            </td>
                            {Array.from(
                              {
                                length: moment(
                                  credentials.month,
                                  "YYYY-MM"
                                ).daysInMonth(),
                              },
                              (_, index) => {
                                const attendanceStatus =
                                  getAttendanceForStudent(
                                    student._id,
                                    index + 1
                                  );
                                if (attendanceStatus === "present")
                                  presentCount++;
                                const stat = attendanceStatus ? (
                                  attendanceStatus === "present" ? (
                                    <FaCheck style={{ color: "green" }} />
                                  ) : (
                                    <FaTimes style={{ color: "red" }} />
                                  )
                                ) : (
                                  ""
                                );
                                return (
                                  <td key={index} className="py-2 px-4 ">
                                    {stat}
                                  </td>
                                );
                              }
                            )}
                            <td className="py-2 px-4">{presentCount}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
      {isModalOpen && selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)} // Close the modal on dismiss
        />
      )}
    </DashboardLayout>
  );
};

export default Attendance;
