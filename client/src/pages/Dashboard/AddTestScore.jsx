import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import React, { useState } from "react";
import { message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { classes, subjects } from "../../constants/Dashboard";
import { BASE_URL } from "../../Service/helper";
import { useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SuccessMessage from "../../components/Models/SuccessMessageModel";
import WarningModel from "../../components/Models/WarningModel";
import ErrorMessageModel from "../../components/Models/ErrorMessageModel";

const AddStudent = () => {
  const navigate = useNavigate();
  const [showStudentList, setShowStudentList] = useState(false);
  const { user } = useSelector((state) => state.user);
  const [errors, setErrors] = useState({});
  const [Success, setSuccess] = useState(false);
  const [Warning, setWarning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [credentials, setCredentials] = useState({
    class: "",
    date: new Date(),
    subject: "",
  });
  const [scoreData, setScoreData] = useState({});
  const [totalMarks, setTotalMarks] = useState(100);
  const [students, setStudents] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scoreDetails, setScoreDetails] = useState([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [scoreWarning, setScoreWarning] = useState(false);
  const [submissionFailed, setSubmissionFailed] = useState(false);

  const handleScoreChange = (studentId, value) => {
    if (value === "" || value === "-") {
      setScoreData((prevData) => ({
        ...prevData,
        [studentId]: value, // Allow "-" temporarily
      }));
      return;
    }
  
    let score = parseInt(value);
    if (!isNaN(score) && score >= -1 && score <= totalMarks) {
      setScoreData((prevData) => ({
        ...prevData,
        [studentId]: score,
      }));
      setErrors((prevErrors) => ({
        ...prevErrors,
        [studentId]: "",
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [studentId]: `Score must be between -1 and ${totalMarks}.`,
      }));
    }
  };
  

  const handleConfirm = async (e) => {
    setScoreWarning(false)
    e.preventDefault();
    let newErrors = {};
  
    if (!credentials.class) newErrors.class = "Please select a class.";
    if (!credentials.subject) newErrors.subject = "Please select a subject.";
    if (!credentials.date) newErrors.date = "Please select a date.";
    if (!selectedFile) newErrors.file = "Please upload a file.";
  
    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    Object.entries(scoreData).forEach(([studentId, score]) => {
      if (score === "") scoreData[studentId] = 0;
    });
    
  
    const scoreRecords = Object.entries(scoreData).map(([studentId, score]) => ({
      studentId,
      score,
    }));
    
    
    const isAllZero = scoreRecords.every((score) => score.score === 0 || score.score === -1);
    if (isAllZero) {
      setScoreData({});
      setScoreWarning(true);
      setShowError(true);
      setErrorMessage("Please enter scores for at least one student.");
      return;
    }
    
    setScoreDetails(scoreRecords);
    setWarning(true)
    setIsModalOpen(true);

  };

  const handleSubmit = async () => {
    setWarning(false)
    setLoading(true);
    setShowError(false);
    setSubmissionFailed(false);

    let newErrors = {};
    const formData = new FormData();

    const localDate = new Date(credentials.date.getTime() - credentials.date.getTimezoneOffset() * 60000);

    formData.append("classId", credentials.class);
    formData.append("subject", credentials.subject);
    formData.append("mentorId", user._id);
    formData.append("date", localDate.toISOString());
    formData.append("totalMarks", totalMarks);
    formData.append("scores", JSON.stringify(scoreDetails));
    if (selectedFile) {
      formData.append("file", selectedFile);
    }
  
    axios
      .post(`${BASE_URL}/submitScore`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setSuccess(true);
  
          setScoreData({});
          setCredentials({
            class: "",
            date: new Date(),
            subject: "",
          });
          setTotalMarks(100);
          setSelectedFile(null);
          setStudents([]);
          setErrors({});
          setShowStudentList(false);
        } else {
          setErrorMessage(res.data.message);
          setShowError(true);
        }
      })
      .catch((error) => {
        // console.error("Error submitting score:", error);
        if (error.response?.status === 409) {
          setErrors((prev) => ({ ...prev, date: error.response.data.message }));
          // setErrorMessage(error.response.data.message);
        } 
         else {
          setErrorMessage("Error submitting score. Please try again.");
          setShowError(true);
          setSubmissionFailed(true);
        }

      })
      .finally(() => {
        setLoading(false);
      });
  }
  
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      (file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ) {
      setSelectedFile(file);
      setErrors({ ...errors, file: "" });
    } else {
      setSelectedFile(null);
      setErrors({ ...errors, file: "Please upload a PDF or Word document." });
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });

    // Clear errors dynamically when the user changes input
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? "" : prevErrors[name], 
    }));

    if (name === "class") {
      setShowStudentList(true);
      fetchStudents(value);
    }
  };

  const fetchStudents = (selectedClass) => {
    axios.get(`${BASE_URL}/students?class=${selectedClass}`)
      .then((response) => {
        const activeStudents = response.data.filter((student) => student.active);
        setStudents(activeStudents);
        const initialData = {};
        activeStudents.forEach((student) => {
          initialData[student._id] = "";
        });
        setScoreData(initialData);
      })
      .catch((error) => console.error("Error fetching students:", error));
  };

  return (
    <DashboardLayout>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <form onSubmit={handleConfirm} encType="multipart/form-data">
          <div className="space-y-8">
            <div className="border-b border-gray-900/10 pb-8">
              <h2 className="text-base font-bold leading-7 text-gray-900">Add Score</h2>
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-gray-900">Subject</label>
                  <select
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                    name="subject"
                    value={credentials.subject}
                    onChange={onChange}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((item, index) => (
                      <option key={index} value={item.id}>{item.subject}</option>
                    ))}
                  </select>
                  {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-gray-900">Class</label>
                  <select
                    name="class"
                    value={credentials.class}
                    onChange={onChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  >
                    <option value="">Select a class</option>
                    {classes.map((item, index) => (
                      <option key={index} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  {errors.class && <p className="text-red-500 text-sm">{errors.class}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-gray-900">Test Date</label>
                  <DatePicker
                    selected={credentials.date}
                    default={""}
                    onChange={(date) => {
                      setCredentials({ ...credentials, date: date });
                      setErrors({ ...errors, date: "" });
                    }}
                    maxDate={new Date()} // Restricts selection to today or earlier
                    dateFormat="dd/MM/yyyy" 
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  />
                  {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
                </div>
              </div>
            </div>

            {showStudentList && (
            <div className="mt-8">
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className=" p-4 rounded-lg shadow-sm">
                  <label className="block text-sm font-medium text-gray-700">Total Marks</label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={totalMarks}
                    min={10}
                    max={100}
                    onChange={(e) => setTotalMarks(e.target.value)}
                  />
                  {errors.totalMarks && <p className="text-red-500 text-sm">{errors.totalMarks}</p>}
                </div>
                <div className=" p-4 rounded-lg shadow-sm">
                  <label className="block text-sm font-medium text-gray-700">Upload Paper</label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="file"
                      accept=".pdf , .doc , .docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
                    >
                      Choose File
                    </label>
                    {selectedFile && !errors.file && (
                      <span className="ml-3 text-sm text-gray-700">{selectedFile.name}</span>
                    )}
                    {errors.file && <p className="ml-2 mt-1 text-sm text-red-500">{" " +  errors.file}</p>}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-4">Students List</h3>
              <p className="text-sm font-medium mb-3">
                ( Note : Add -1 as test score for those student who is absent in
                the test)
              </p>
              <table className="w-full text-sm text-left text-gray-500 ">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-x border-t">
                  <tr>
                    <th className=" border-gray-300 p-2">Student Name</th>
                    <th className=" border-gray-300 p-2">Add Test Score</th>
                  </tr>
                </thead>
                <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <th
                      scope="row"
                      className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap"
                    >
                      {student.name}
                    </th>

                    <td className="px-3 py-1">
                    <input
                      type="number"
                      value={scoreData[student._id] !== undefined ? scoreData[student._id].toString() : ""}
                      placeholder="0"
                      min={-1}
                      max={totalMarks}
                      onChange={(e) => handleScoreChange(student._id, e.target.value)}
                      className={`border border-gray-300 rounded p-1 w-20 ${errors[student._id] ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""} focus:ring-indigo-500 focus:border-indigo-500`}
                    />

                      {/* {errors[student._id] && <p className="text-red-500">{errors[student._id]}</p>} */}
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="button"
              className="text-sm font-semibold leading-6 text-gray-900"
              disabled={loading}
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading} // Disable the button when loading
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                "Save"
              )}

            </button>
          </div>
        </form>
        {Success && (
          <SuccessMessage message="Test Score Added Successfully!" onClose={() => setSuccess(false)} />
        )}
        {Warning && (
          <WarningModel
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleSubmit}
            title={"Are you sure want to submit?"}
            details={"You won't be able to revert this!"}
          />
        )}
        {/* Error Modal */}
       { submissionFailed &&
        <ErrorMessageModel
          isOpen={showError}
          onClose={() => setShowError(false)}
          onRetry={handleSubmit}
          title="Submission Failed"
          message={errorMessage}
        />}
       { scoreWarning &&
        <ErrorMessageModel
          isOpen={showError}
          onClose={() => setShowError(false)}
          onRetry={handleConfirm}
          title="Submission Failed"
          message={errorMessage}
        />}
      </div>
    </DashboardLayout>
  );
};

export default AddStudent;