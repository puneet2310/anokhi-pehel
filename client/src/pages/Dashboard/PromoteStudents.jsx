import DashboardLayout from "../../components/Dashboard/DashboardLayout.jsx";
import Header from "../../components/Dashboard/Header.jsx";
import { useSelector } from "react-redux";
import { MdDelete } from "react-icons/md";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../Service/helper.js";
import Spinner from "../../components/Spinner.jsx";
import { classes } from "../../constants/Dashboard/index.jsx";
import ErrorMessageModel from "../../components/Models/ErrorMessageModel.jsx";
import WarningModal from "../../components/Models/WarningModel.jsx";
import Button from "../../components/Dashboard/Button.jsx";
import SuccessMessageModel from "../../components/Models/SuccessMessageModel.jsx";
const PromoteStudents = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => state.user);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [promoteDataList, setPromoteDataList] = useState([]);
  const [inputClassError, setinputClassError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('')
  const [warningMessage, setWarningMessage] = useState('')
  const [warningOpen, setWarningOpen] = useState(false)
  const [studentsToPromote, setStudentsToPromote] = useState([]);
  const [promotedClass, setPromotedClass] = useState('')
  const [isPromotingAllowed, setIsPromotingAllowed] = useState(false);
  const [statusUpdationError, setStatusUpdationError] = useState(false);
  const [normalError, setNormalError] = useState(false);
  const [Success, setSuccess] = useState(false)
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);  

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true)
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/settings`);
        if (response.data) {
          const setting = response.data.find(
            (item) => item.key === "isPromotingAllowed"
          );
          if (setting) {
            setIsPromotingAllowed(setting.value); // Set the fetched setting value
          }
        }
      } catch (error) {
        console.error("Error fetching settings", error);
      }
    };
    fetchSettings();
    setIsLoading(false)
  }, []);


  const fetchStudents = (selectedClass) => {
    setWarningMessage('')
    setWarningOpen(false)
    setErrorMessage('')
    setinputClassError(false);
    setNormalError(false);
    setIsFetchingStudents(true);
    axios
      .get(`${BASE_URL}/students?class=${selectedClass}`)
      .then((response) => {
        const allstudents = response.data
        setStudents(allstudents);

        const initialPromoteData = allstudents.map((student) => ({
          studentId: student._id,
          studentName: student.name,
          newClass: student.className === "Nursery" ? "1" : student.className === "Navodaya" ? "6" : student.className === "12" ? "Select a class" : (parseInt(student.className) + 1).toString(), // Convert number to string
          notPromoted: student.active ? false : true,
          activeStatus: student.active 
        }));
        setPromoteDataList(initialPromoteData);
        setPromotedClass(initialPromoteData[0]?.newClass)

      })
      .catch((error) => {
        setStudents([]);
        console.error("Error fetching students:", error);
        setNormalError(true)
        setErrorMessage("Please try again later");
      });
      setIsFetchingStudents(false);
  };


  // Toggle "Not Promoted" state
  const handleNotPromoted = (studentId) => {
    const data = promoteDataList.find((data) => data.studentId === studentId);
    if(data.activeStatus === false) return;
    setPromoteDataList((prev) =>
      prev.map((data) =>
        data.studentId === studentId
          ? { ...data, notPromoted: !data.notPromoted }
          : data
      )
    );
  };

  // Handle promotion for all active students
  const handlePromote = async (studentsToPromote) => {
    setWarningOpen(false);
    setIsLoading(true);
    try {
      await Promise.all(
        studentsToPromote.map((data) =>
          axios.put(`${BASE_URL}/promoteStudent/${data.studentId}`, {
            newClass: data.newClass,
          })
        )
      );

      // Update local state
      fetchStudents(selectedClass);
    } catch (error) {
      console.error("Error promoting students:", error);
      setNormalError(true)
      setErrorMessage("Please try again later !!");
    }
    setIsLoading(false);
  };

  //check any error
  const handleConfirm = () => {
    if (promoteDataList.length === 0) return;

    const students = promoteDataList.filter((data) => (!data.notPromoted && data.activeStatus));

    let flag = false;

    //if there is any student without class
    students.forEach((data) => {
      if (data.newClass === "Select a class" || data.newClass === "") {
        flag = true;
        setErrorMessage(`Please select the class for ${data.studentName}`);
      }
    });

    if (flag) {
      setinputClassError(true);
      return;
    }

    setErrorMessage("");
    setinputClassError(false);
    setStudentsToPromote([...students]);  // Create a new array to force re-render
    setWarningOpen(true);
  };

  const handleClassChange = (e, studentId) => {
    setPromoteDataList((prev) => {
      const updatedList = prev.map((data) =>
        data.studentId === studentId ? { ...data, newClass: e.target.value } : data
      );
      return updatedList;
    })
  }

  //handle of acceptingResponse or NOT
  const handleToggle = async (checked) => {
    const updatedValue = !isPromotingAllowed;
    try {
      await axios.post(`${BASE_URL}/updateSettings`, {
        key: "isPromotingAllowed",
        value: updatedValue,
      });
      setIsPromotingAllowed(updatedValue);

    } catch (error) {
      console.error("Error updating setting", error);
      setNormalError(true)
      setErrorMessage("Error while updating setting. Please try again later !!");
    }
  };

  //change the status of particular student
  const handleChangeStatus = async(studentId) => {

    try {
      //find the active status of studentId from promoteDataList
      const data = promoteDataList.find((data) => data.studentId === studentId);
      // console.log(data);
      const response = await axios.put(`${BASE_URL}/updateStudentStatus/${studentId}`, {
        activeStatus: !data.activeStatus,
      })

      const newStatus = response.data.active;

      setPromoteDataList((prev) =>
        prev.map((data) =>
          data.studentId === studentId
            ? { ...data, activeStatus: newStatus }
            : data
        )
      );
      setPromoteDataList((prev) => 
        prev.map((data) => 
          data.studentId === studentId
            ? { ...data, notPromoted: !newStatus }
            : data
      ));
    } catch (error) {
      console.error("Error updating student status:", error);
      setErrorMessage('Failed to update student status.');
      setStatusUpdationError(true);
    }
  }

  return (
    <DashboardLayout>
      <div className="m-2 md:m-5 mt-12 p-2 md:p-0 bg-white rounded-3xl flex flex-row justify-between items-center">
        <Header category="Academics" title="Promoting Students to Next Class" />
        <div>
          {user?.isAdmin === true && (
            <div>
              <label className="ml-2 inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPromotingAllowed}
                  className="sr-only peer"
                  onChange={handleToggle}
                  disabled={!user?.isAdmin}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  {isPromotingAllowed
                    ? "Accepting Responses"
                    : "Not Accepting Responses"}
                </span>
              </label>
            </div>
          )}
        </div>

      </div>
      {(isPromotingAllowed || user?.isAdmin) &&
        <div className="ml-3">
        <p className="text-gray-600">
          1. Select a class to promote students from.
        </p>
        <p className="text-gray-600">
          2. Click on "Promote" button to promote selected students.
        </p>
        <p className="text-red-500">
          3. In-Active Students will not promoted to the next class.
        </p>
      </div>}
      {(isPromotingAllowed || user?.isAdmin) && (
        <div className="mt-5 p-2 md:p-10 bg-white rounded-3xl">
          {/* <Header category="Academics" title="Promote Students to Next Class" /> */}
          <div className="mx-auto max-w-screen-xl">
            <div className="bg-white relative shadow-md sm:rounded-lg">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                <div className="w-full md:w-1/2">
                  <select
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-[200px] p-2"
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      fetchStudents(e.target.value);
                    }}
                  >
                    <option value="">Select Class</option>
                    {classes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedClass && isFetchingStudents && 
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                  <p className="ml-2 text-gray-600">Loading Students...</p>
                </div>
              }

              {selectedClass && students.length > 0 && (
                <>
                  {/* Desktop View - Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-x border-t">
                        <tr>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Class</th>
                          <th className="px-4 py-3">Phone</th>
                          <th className="px-4 py-3">Location</th>
                          <th className="px-4 py-3">Mode</th>
                          <th className="px-4 py-3">School</th>
                          <th className="px-4 py-3">Promote To</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="border-b">
                        {students.map((student) => {
                          const promoteData = promoteDataList.find((p) => p.studentId === student._id);
                          return (
                            <tr key={student._id} className="border-x">
                              <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                                {student.name}
                              </td>
                              <td className="px-4 py-3">{student.className}</td>
                              <td className="px-4 py-3">{student.phone}</td>
                              <td className="px-4 py-3">{student.location}</td>
                              <td className="px-4 py-3">{student.mode}</td>
                              <td className="px-4 py-3">{student.school}</td>
                              <td className="px-4 py-3 flex ">
                                <select
                                  value={promoteData?.newClass || ""}
                                  onChange={(e) => handleClassChange(e, student._id)}
                                  className="w-[140px] rounded-md border border-gray-300 px-2 py-1 text-gray-900 focus:ring-2 focus:ring-indigo-600 "
                                  disabled={promoteData?.notPromoted || !promoteData?.activeStatus}
                                >
                                  <option value="">Select a class</option>
                                  {classes.map((item) => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                  ))}
                                </select>
                                <button
                                  className={`px-2 py-1 rounded-md ml-10 w-[100px] text-center ${
                                    promoteData?.notPromoted ? "bg-red-400 text-black" : "bg-green-300 text-black"
                                  }`}
                                  onClick={() => handleNotPromoted(student._id)}
                                >
                                  {promoteData?.notPromoted ? "Not Promoted" : "Promoted"}
                                </button>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  className={`px-2 py-1 rounded-md w-[100px] text-center ${
                                    !promoteData?.activeStatus ? "bg-red-400 text-black" : "bg-green-300 text-black"
                                  }`}
                                  onClick={() => handleChangeStatus(student._id)}
                                >
                                  {promoteData?.activeStatus ? "Active" : "In Active"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View - Card Layout */}
                  <div className="md:hidden flex flex-col gap-4 p-2">
                    {students.map((student) => {
                      const promoteData = promoteDataList.find((p) => p.studentId === student._id);
                      return (
                        <div key={student._id} className="bg-white p-4 shadow-md rounded-md border relative">
                          {/* Name and Details */}
                          <p className="font-semibold text-lg text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">Class: {student.className}</p>
                          <p className="text-sm text-gray-600">Phone: {student.phone}</p>
                          <p className="text-sm text-gray-600">Location: {student.location}</p>
                          <p className="text-sm text-gray-600">Mode: {student.mode}</p>
                          <p className="text-sm text-gray-600">School: {student.school}</p>

                          {/* Promotion Dropdown */}
                          <div className="mt-2 flex flex-col gap-2">
                            <select
                              value={promoteData?.newClass || ""}
                              onChange={(e) => handleClassChange(e, student._id)}
                              className="w-full rounded-md border border-gray-300 px-2 py-1 text-gray-900 focus:ring-2 focus:ring-indigo-600"
                              disabled={promoteData?.notPromoted || !promoteData?.activeStatus}
                            >
                              <option value="">Select a class</option>
                              {classes.map((item) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Status Toggle Button - Same as Desktop */}
                          <div className="mt-4 flex justify-between items-center">
                            <span className="text-gray-600">Promote OR Not:</span>
                            <button
                              className={`px-2 py-1 rounded-md ml-10 w-[100px] text-center ${
                                promoteData?.notPromoted ? "bg-red-400 text-black" : "bg-green-300 text-black"
                              }`}
                              onClick={() => handleNotPromoted(student._id)}
                            >
                              {promoteData?.notPromoted ? "Not Promote" : "Promote"}
                            </button>
                          </div>

                          <div className="mt-4 flex justify-between items-center">
                            <span className="text-gray-600">Status:</span>
                            <button
                              className={`px-2 py-1 rounded-md w-[100px] text-center ${
                                !promoteData?.activeStatus ? "bg-red-400 text-black" : "bg-green-300 text-black"
                              }`}
                              onClick={() => handleChangeStatus(student._id)}
                            >
                              {promoteData?.activeStatus ? "Active" : "In Active"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {students.length > 0 &&
                <div className="flex justify-center mt-4">
                  <button
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition 
                      ${isLoading ? 'bg-indigo-600 cursor-not-allowed opacity-70' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                    onClick={handleConfirm}
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    )}
                    {isLoading ? "Promoting..." : "Promote"}
                  </button>

                </div>
              }
            </div>

            {students.length === 0 && !selectedClass && <p className="text-center text-lg text-gray-600">Please select a class</p>}
            {students.length === 0 && selectedClass && <p className="text-center text-lg text-gray-600">No students in class {selectedClass}</p>}

          </div>
            <ErrorMessageModel isOpen={inputClassError} onClose={() => setinputClassError(false)} onRetry={handleConfirm} title="Submission Failed" message={errorMessage} />
            <ErrorMessageModel isOpen={statusUpdationError} onClose={() => setStatusUpdationError(false)} title="Updation Failed" message={errorMessage} />
            <ErrorMessageModel isOpen={normalError} onClose={() => setNormalError(false)} title="Something went wrong" message={errorMessage} />

            <WarningModal isOpen={warningOpen} onClose={() => setWarningOpen(false)} onConfirm={() => handlePromote(studentsToPromote)} title="Are you sure you want to submit?" details="Please see once again !!" />
            {Success && (
              <SuccessMessageModel message="Status Chnaged Successfully!" onClose={() => setSuccess(false)} />
            )}
        </div>
      )}

      {(!isLoading && !isPromotingAllowed && !user?.isAdmin) && 
        <div className="flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-4"> Promoting of Students Closed</h2>
            <p className="text-gray-600">
              Please{" "}
              <span
                className="text-blue-600 cursor-pointer underline"
                onClick={() => navigate("/Issue")}
              >
                contact the Web Team
              </span>{" "}
              for more information.
            </p>
          </div>

        </div>
      }
    </DashboardLayout>
  );
};

export default PromoteStudents;