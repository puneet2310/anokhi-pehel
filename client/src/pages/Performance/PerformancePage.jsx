import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { classes, subjects } from "../../constants/Dashboard";
import { BASE_URL } from "../../Service/helper";

const PerformancePage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    selectedClass: "",
    subject: "",
  });

  const [viewMode, setViewMode] = useState("Student-Wise"); 
  const [students, setStudents] = useState([]);
  const [errors, setErrors] = useState({});
  const [testDetails, setTestDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  const onChange1 = (e) => {
    setTestDetails([]);

    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });

    // Clear errors dynamically when the user changes input
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? "" : prevErrors[name],
    }));

    if (name === "selectedClass") {
      fetchStudents(value);
    }
  };

  const onChange2 = (e) => {
    setStudents([]);
    const { name, value } = e.target;

    setCredentials((prevCredentials) => {
      const updatedCredentials = { ...prevCredentials, [name]: value };

    //  console.log("Updated Credentials:", updatedCredentials);

      if (updatedCredentials.selectedClass && updatedCredentials.subject) {
        fetchTestDetails(updatedCredentials.subject, updatedCredentials.selectedClass);
      }

      return updatedCredentials;
    });
  };

  const onChangeViewMode = (e) => {
    const newViewMode = e.target.value;
    setViewMode(newViewMode);
    // console.log(newViewMode);

    if(newViewMode === "Student-Wise") {
      setTestDetails([]);
      
      if(credentials.selectedClass){
        // console.log("go for fetching")
        fetchStudents(credentials.selectedClass);
      }
    }
    else{
      setStudents([]);

      if(credentials.selectedClass && credentials.subject){
        fetchTestDetails(credentials.subject, credentials.selectedClass);
      }
    }
  };

  const fetchStudents = (selectedClass) => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/students?class=${selectedClass}`)
      .then((response) => {
        const activeStudents = response.data.filter((student) => student.active);
        setStudents(activeStudents);
      })
      .catch((error) => {
        setStudents([]);
        console.error("Error fetching students:", error)
      });
    
    setLoading(false);
  };

  const fetchTestDetails = (subject, selectedClass) => {
    setLoading(true);
    axios
      .get(
        `${BASE_URL}/tests?subject=${subject}&selectedClass=${selectedClass}`
      )
      .then((response) => {
        // console.log(response.data);
        setTestDetails(response.data);

        //sort on the basis of date
        const sortedTestDetails = response.data.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA;
        });
        // console.log(sortedTestDetails);
        setTestDetails(sortedTestDetails);
      })
      .catch((error) => {
        setTestDetails([]);
        console.error("Error fetching test details:", error);
      });

    setLoading(false);
  };

  const viewScores = (studentId, testId) => {
    if (!credentials.selectedClass) {
      setErrors({ class: "Please select a class" });
      return;
    }
    if (!credentials.subject) {
      setErrors({ subject: "Please select a subject" });
      return;
    }

    if (viewMode === "Student-Wise") {
      navigate(`/Scores-Pict?studentId=${studentId}&subjectId=${credentials.subject}&classId=${credentials.selectedClass}`);
    } else {
      navigate(`/Scores?testId=${testId}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <form encType="multipart/form-data">
          <div className="space-y-8">
            <div className="border-b border-gray-900/10 pb-8">
              <h2 className="text-base font-bold leading-7 text-gray-900">
                View Students & Scores
              </h2>
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Class
                  </label>
                  <div className="mt-2">
                    <select
                      name="selectedClass"
                      id="selectedClass"
                      value={credentials.selectedClass}
                      onChange={viewMode === "Student-Wise" ? onChange1 : onChange2}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                    >
                      <option value="">Select a class</option>
                      {classes.map((item, index) => (
                        <option key={index} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    {errors.class && <p className="ml-2 mt-1 text-sm text-red-500">{" " +  errors.class}</p>}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="w-1/2 pr-2">
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      Subject
                    </label>
                    <div className="mt-2">
                      <select
                        name="subject"
                        id="subject"
                        value={credentials.subject}
                        onChange={viewMode === "Student-Wise" ? onChange1 : onChange2}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                      >
                        <option value="">Select a subject</option>
                        {subjects.map((item, index) => (
                          <option key={index} value={item.id}>
                            {item.subject}
                          </option>
                        ))}
                      </select>
                      {errors.subject && <p className="ml-2 mt-1 text-sm text-red-500">{" " +  errors.subject}</p>}
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="w-1/2 pl-2">
                    <label className="block text-sm font-medium leading-6 text-gray-900">
                      View Mode
                    </label>
                    <div className="mt-2">
                      <select
                        name="viewMode"
                        id="viewMode"
                        value={viewMode}
                        onChange={onChangeViewMode}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                      >
                        <option value="Student-Wise">Student-Wise</option>
                        <option value="Test-Wise">Test-Wise</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
        
        { viewMode === "Student-Wise" && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Student List</h3>
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-x border-t">
                <tr>
                  <th className="border-gray-300 p-2">Serial No.</th>
                  <th className="border-gray-300 p-2">Student Name</th>
                  <th className="border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <p className="text-center text-gray-500 mt-4">Loading...</p>}
                {!loading &&students.map((student, index) => (
                  <tr key={student._id}>
                    <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2">
                      <button
                        className="text-indigo-600 hover:text-indigo-800"
                        onClick={() => viewScores(student._id, null)}
                      >
                        View Score
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}

        { viewMode === "Test-Wise" && testDetails && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Test Details</h3>
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-x border-t">
                <tr>
                  <th className="border-gray-300 p-2">Serial No.</th>
                  <th className="border-gray-300 p-2">Date</th>
                  <th className="border-gray-300 p-2">More Details</th>
                </tr>
              </thead>
              <tbody>
              {loading && <p className="text-center text-gray-500 mt-4">Loading...</p>}
                {!loading && testDetails.map((test, index) => (
                  // console.log(test),
                  <tr key={test.id}>
                    <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(test.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        timeZone: "UTC", // Ensures consistent date representation
                      })}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="text-indigo-600 hover:text-indigo-800"
                        onClick={() => viewScores(null, test.date)}
                      >
                        View Scores
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PerformancePage;

