import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { classes } from "../../constants/Dashboard";
import { BASE_URL } from "../../../src/Service/helper";
import { useSelector } from "react-redux";
import StudentProfileModal from "../../Modals/studentProfileModal";
import { FaCheck, FaTimes } from "react-icons/fa";
import SuccessMessageModel from "../../components/Models/SuccessMessageModel";

const Attendance = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const [credentials, setCredentials] = useState({ classId: "" });
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [presentStatus, setPresentStatus] = useState({});
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const onChange = async (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });

    if (name === "classId" && value) {
      await fetchStudents(value);
      await fetchLastFiveDaysAttendance(value);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      const response = await axios.get(`${BASE_URL}/students?class=${classId}`);
      const activeStudents = response.data.filter((student) => student.active);
      setStudents(activeStudents);

      const initialStatus = {};
      activeStudents.forEach(student => {
        initialStatus[student._id] = false;
      });
      setPresentStatus(initialStatus);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchLastFiveDaysAttendance = async (classId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/lastFiveDaysAttendance`, {
        params: { classId },
      });
      console.log(response.data)
      setAttendanceData(response.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePresentStatus = (studentId) => {
    setPresentStatus(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const openModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const lastFiveDays = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (4 - i));
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });

  const renderAttendanceStatus = (studentId) => {
    if (loading) return <div>Loading...</div>;
  
    const studentAttendance = attendanceData[studentId] || [];
  
    return (
      <div className="flex justify-between w-full gap-1 sm:gap-1 md:gap-1 lg:gap-1">
        {lastFiveDays.map((dateStr, index) => {
          const dayData = studentAttendance.find((d) => d.date === dateStr) || null;
  
          return (
            <div 
              key={index} 
              className="flex justify-center w-5 md:w-6" // Adjusted width for different screens
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2
                  ${dayData
                    ? dayData.marked
                      ? dayData.status === "present"
                        ? "bg-green-500 text-white border-green-600"
                        : "bg-red-500 text-white border-red-600"
                      : "border-gray-300 text-gray-300 bg-white"
                    : "border-gray-300 text-gray-300 bg-white"
                  }`}
                title={dayData ? 
                  (dayData.marked 
                    ? `${dateStr}: ${dayData.status}`
                    : `${dateStr}: No data`)
                  : `${dateStr}: No data`}
              >
                {dayData ? 
                  (dayData.marked 
                    ? (dayData.status === "present" 
                        ? <FaCheck size={10}/> 
                        : <FaTimes size={10}/>)
                    : "○")
                  : "○"}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const attendanceRecords = Object.entries(presentStatus).map(
      ([studentId, status]) => ({
        studentId,
        status: status ? "present" : "absent",
      })
    );

    const today = new Date();
    const localDate = today.toLocaleDateString("en-CA"); //Correct local date format

    const attendanceSubmission = {
      classId: credentials.classId,
      date: localDate, 
      mentorId: user._id,
      attendanceRecords,
    };

    axios
      .post(`${BASE_URL}/submitAttendance`, attendanceSubmission)
      .then((response) => {
        console.log(response.data);
        if (response.data === "Attendance submitted successfully") {
          setSuccess(true);
          setSuccessMessage("Attendance Saved Successfully");
          setCredentials({ classId: "" });
          setPresentStatus({});
          setStudents([]);

        } else if (response.data === "Attendance updated successfully") {
          setSuccess(true);
          setSuccessMessage("Attendance Updated Successfully");
          setCredentials({ classId: "" });
          setPresentStatus({});
          setStudents([]);

        }
      })
      .catch((error) => {
        console.error(error);
      })
      
  };

  return (
    <DashboardLayout>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="space-y-8">
            <div className="border-b border-gray-900/10 pb-8">
              <h2 className="text-base font-bold leading-7 text-gray-900">
                Add Attendance
              </h2>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Class
                  </label>
                  <div className="mt-2">
                    <select
                      name="classId"
                      value={credentials.classId}
                      onChange={onChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                      required
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

          {students.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">Students List</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-x border-t">
                <tr>
                  <th className="border-gray-900 p-2 text-gray-900">Student Name</th>
                  <th className="border-gray-900 p-2 text-gray-900">
                    <div className="flex flex-col">

                      {/* Date headers */}
                      <span className="text-center">Last 5 Days </span>
                      <div className="flex justify-between mt-2 gap-3 md:gap-2">
                        {lastFiveDays.map((dateStr, index) => (
                          <div key={`date-${index}`} className="w-5 md:w-5 text-center text-xs">
                            {dateStr}
                          </div>
                        ))}
                      </div>
                    </div>
                  </th>
                  <th className="border-gray-900 p-2 text-gray-900 text-center">Present</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-b">
                    <td
                      className="font-bold text-gray-900 cursor-pointer py-4"
                      onClick={() => openModal(student)}
                    >
                      {student.name}
                    </td>
                    
                    <td className="py-4">
                      {renderAttendanceStatus(student._id)}
                    </td>

                    <td className="py-4 mt-7 flex justify-center items-center">
                      <input
                        type="checkbox"
                        checked={presentStatus[student._id] || false}
                        onChange={() => togglePresentStatus(student._id)}
                        className="h-6 mb-7 w-6 rounded border-2 border-black text-indigo-600 focus:ring-indigo-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="button"
              className="text-sm font-semibold leading-6 text-gray-900"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Save Attendance
            </button>
          </div>
        </form>
      </div>
      {isModalOpen && selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {success && (
        <SuccessMessageModel message={successMessage} onClose={() => setSuccess(false)} />
      )}
    </DashboardLayout>
  );
};

export default Attendance;
