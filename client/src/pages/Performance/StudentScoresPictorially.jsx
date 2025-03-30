import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../Service/helper";
import PerformanceLineChart from "./PerformanceLineChart";

const StudentScoresPictorially = () => {
  const queryParams = new URLSearchParams(location.search);
  const studentId = queryParams.get("studentId");
  const subjectId = queryParams.get("subjectId");
  const classId = queryParams.get("classId");
  const [studentScores, setStudentScores] = useState([]);
  const [classAverage, setClassAverage] = useState([]);
  const [studentScoresWithAbsences, setStudentScoresWithAbsences] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [viewMode, setViewMode] = useState("date");
  const [filteredData, setFilteredData] = useState([]);
  const [filteredAvgData, setFilteredAvgData] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState(2);

  const durationOptions = [2, 5, 8, 12];

  useEffect(() => {
    const fetchStudentName = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/getstudentByUserId?studentid=${studentId}`);
        setStudentName(response.data.name);
      } catch (error) {
        console.error("Error fetching student name:", error);
      }
    };

    const fetchTestData = async () => {
      try {
        // console.log("sUBJECYT IS : ",subjectId)
        const response = await axios.get(`${BASE_URL}/get-graph?studentId=${studentId}&subjectId=${subjectId}&classId=${classId}`);
        const sortedScores = response.data.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        // console.log(sortedScores);
        setStudentScoresWithAbsences(sortedScores);
        setStudentScores(sortedScores.filter(score => score.score > -1));
      } catch (error) {
        console.error("Error fetching test details:", error);
      }
    };

    fetchTestData();
    fetchStudentName();
  }, [studentId, subjectId]);

  useEffect(() => {
    if (studentScoresWithAbsences.length === 0) return;

    const fetchClassAverage = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/getAverage?classId=${classId}&subjectId=${subjectId}`);
        const sortedAvgScore = response.data.data.sort((a, b) => new Date(a.date) - new Date(b.date));

        const filteredAvgScores = sortedAvgScore.filter((score) => {
          const date = new Date(score.date).toISOString();
        
          // Check if the date is present in studentScoresWithAbsences
          const matchingStudentScore = studentScoresWithAbsences.find(
            (studentScore) => studentScore.date && new Date(studentScore.date).toISOString() === date
          );
        
          // Include only if the date is present in studentScoresWithAbsences and the student's score is not -1
          return matchingStudentScore && matchingStudentScore.score > -1;
        });
                
        setClassAverage(filteredAvgScores);
        filterData(studentScores, classAverage, selectedDuration);
      } catch (error) {
        console.log("Error fetching class average:", error);
      }
    };

    fetchClassAverage();
  }, [studentScoresWithAbsences]);

  useEffect(() => {
    filterData(studentScores, classAverage, selectedDuration);
  }, [selectedDuration, studentScores, classAverage, viewMode]);

  const filterData = (data, avgData, months) => {
    if (!data || data.length === 0) {
      setFilteredData([]);
      setFilteredAvgData([]);
      return;
    }

    const now = new Date();
    const cutoffDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() - months, now.getDate()));

    const filtered = data.filter((entry) => new Date(entry.date) >= cutoffDate);
    const filteredAvg = avgData.filter((entry) => new Date(entry.date) >= cutoffDate);

    if (filtered.length === 0) {
      setFilteredData([]);
      setFilteredAvgData([]);
      return;
    }

    if (viewMode === "monthly") {
      const aggregateData = (dataset) => {
        const monthlyData = {};
        dataset.forEach((entry) => {
          const monthKey = `${new Date(entry.date).getFullYear()}-${new Date(entry.date).getMonth() + 1}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { sum: 0, count: 0 };
          }
          if(entry.score > -1){
            monthlyData[monthKey].sum += entry.score;
            monthlyData[monthKey].count += 1;
          }
        });

        return Object.entries(monthlyData).map(([month, data]) => {
          const [year, monthIndex] = month.split("-").map(Number);
          return {
            month: new Date(year, monthIndex - 1, 1).toLocaleString("default", { month: "short", year: "numeric" }),
            score: data.sum / data.count,
          };
        });
      };

      // console.log("filtered",filtered)
      // console.log("filteredAvg",filteredAvg)  

      const newFilteredData = aggregateData(filtered);
      const newAverageData = aggregateData(filteredAvg);

      // console.log("newFilteredData",newFilteredData)
      // console.log("newAverageData",newAverageData)
      
      setFilteredData(newFilteredData.length > 0 ? newFilteredData : []);
      setFilteredAvgData(newAverageData.length > 0 ? newAverageData : []);
    } else {
      setFilteredData(filtered.length > 0 ? filtered : []);
      setFilteredAvgData(filteredAvg.length > 0 ? filteredAvg : []);
    }
  };

  return (
    <DashboardLayout>
      <div className="m-2 md:m-0 mt-16 p-4 sm:p-6 md:p-7 bg-white rounded-3xl w-full min-h-[200px]">
        {/* Score Card Heading */}
        <h2 className="text-center text-xl font-bold tracking-tight text-slate-900 sm:text-lg">
          Score Card
        </h2>

        {/* Student Info Section */}
        <div className="bg-gray-50 p-4 rounded-md mb-6 shadow w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 sm:gap-4 text-center">
            <div className="min-h-[50px] flex flex-col justify-center">
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-medium text-gray-900 break-words sm:text-base">{studentName}</p>
            </div>
            <div className="min-h-[50px] flex flex-col justify-center">
              <p className="text-sm text-gray-600">Class</p>
              <p className="text-lg font-medium text-gray-900 sm:text-base">{classId}</p>
            </div>
            <div className="min-h-[50px] flex flex-col justify-center">
              <p className="text-sm text-gray-600">Subject</p>
              <p className="text-lg font-medium text-gray-900 sm:text-base">{subjectId}</p>
            </div>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="w-full">
          <div className="flex flex-wrap justify-center md:justify-between items-center mb-2 p-2 gap-2">
            {/* Duration Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              {durationOptions.map((duration) => (
                <button
                  key={duration}
                  className={`px-3 py-1 rounded-full border border-indigo-400 text-indigo-500 text-sm cursor-pointer ${
                    selectedDuration === duration ? "bg-indigo-200" : "bg-white"
                  }`}
                  onClick={() => setSelectedDuration(duration)}
                >
                  Last {duration} Months
                </button>
              ))}
            </div>

            {/* Dropdown Selector */}
            <select
              onChange={(e) => setViewMode(e.target.value)}
              value={viewMode}
              className="px-3 py-2 w-full sm:w-36 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200"
            >
              <option value="date">Date-wise</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Chart Container */}
        <div className="w-full mt-5 max-w-full min-h-[300px]">
          <PerformanceLineChart data={filteredData} avgData={filteredAvgData} viewMode={viewMode} />
        </div>

        <div className="text-center mt-10">
          <h3 className="text-red-600 font-medium">
            Recommended: Use laptop or tablet for performance analysis
          </h3>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentScoresPictorially;