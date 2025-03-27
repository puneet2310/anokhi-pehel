import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { BASE_URL, SERVER_URL } from "../../../src/Service/helper";
import { subjects } from "../../constants/Dashboard";
import PerformanceBarChart from "../Performance/PerformanceBarChart";

const Student = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const studentId = searchParams.get("student._id");
  const [student, setStudent] = useState(null);
  const [marks, setMarks] = useState([]);
  const [barChartData, setBarChartData] = useState({});
  const [performanceLoading, setPerformanceLoading] = useState(false);

  useEffect(() => {
    if (studentId) {
      axios
        .get(`${BASE_URL}/getstudentByUserId?studentid=${studentId}`)
        .then((res) => {
          setStudent(res.data);
        })
        .catch((err) => {
          console.error("Error fetching student: ", err);
        });
    }
  }, [studentId]);

  useEffect(() => {
    if (!student || subjects.length === 0) return;

    const fetchBarChartData = async () => {
      try {
        setPerformanceLoading(true);
        setBarChartData({});
        const subjectData = {};

        for (let subject of subjects) {
          const subjectKey = subject.id;
          // console.log("Fetching data for subject:", subjectKey);

          try {
            const response = await axios.get(
              `${BASE_URL}/get-graph?studentId=${studentId}&subjectId=${subjectKey}&classId=${student.className}`
            );

            // console.log("API Response:", response.data);

            if (response.data.data && response.data.data.length > 0) {
              subjectData[subjectKey] = response.data.data;
            } 
            else {
              subjectData[subjectKey] = []; 
            }
          } 
          catch (error) {
            console.error(`Error fetching data for ${subjectKey}:`, error);
            subjectData[subjectKey] = [];
          }
        }

        // console.log("Subject data:", subjectData);

        for (let subject in subjectData) {
          subjectData[subject] = subjectData[subject].sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
          });
        }

        // console.log("Sorted subject data:", subjectData);
        setBarChartData(subjectData);
      } catch (error) {
        console.error("Error fetching bar chart data:", error);
      } finally {
        setPerformanceLoading(false);
      }
    };

    if(student.className)fetchBarChartData();
    // console.log(barChartData);
  }, [student, subjects]);

  return (
    <DashboardLayout>
      <div>
        <h2 className="text-2xl font-bold">Student Profile</h2>
        <div className="flex justify-center items-center h-full">
          <div className="w-full max-w-screen-lg">
            {student ? (
              <div className="flex flex-col md:flex-row md:space-x-8 justify-center items-center">
                <div className="flex-shrink-0">
                  <img
                    src={`${SERVER_URL}/images/${student.photo}`}
                    className="mentor-photo h-40 w-40 rounded-full"
                    alt="Student"
                  />
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="text-xl font-bold">{student.name}</h3>
                  <p>
                    <span className="font-semibold">Location:</span>{" "}
                    <span className="text-blue-600">{student.location}</span>
                  </p>
                  <p>
                    <span className="font-semibold">Mode:</span>{" "}
                    <span className="text-blue-600">{student.mode}</span>
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span>{" "}
                    <span className="text-blue-600">{student.phone}</span>
                  </p>
                  <p>
                    <span className="font-semibold">School:</span>{" "}
                    <span className="text-blue-600">{student.school}</span>
                  </p>
                  <p>
                    <span className="font-semibold">Class:</span>{" "}
                    <span className="text-blue-600">{student.className}</span>
                  </p>
                  <p>
                    <span className="font-semibold">Address:</span>{" "}
                    <span className="text-blue-600">{student.address}</span>
                  </p>
                </div>
              </div>
            ) : (
              <p>No student data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Performance Chart Section */}
        <h2 className="text-xl font-bold text-center mb-4 mt-10">
          {student?.name}'s Overall Performance
        </h2>
      <div className="overflow-x-auto px-6">
        <div className="min-w-[600px] h-[400px]">
          {performanceLoading ? (
            <div className="flex justify-center items-center h-full">
              <span className="text-lg font-semibold text-gray-600">
                Loading Performance Data...
              </span>
            </div>
          ) : (
            <PerformanceBarChart barChartData={barChartData} subjects={subjects} />
          )}
        </div>

      </div>

      <div className="text-center mt-4">
        <h3 className="text-red-600 font-medium">
          Recommended: Use laptop or tablet for performance analysis
        </h3>
      </div>
    </DashboardLayout>
  );
};

export default Student;