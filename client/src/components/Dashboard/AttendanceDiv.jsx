import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../Service/helper";

const AttendanceBoxes = ({ classId }) => {
  const [isAttendanceTaken, setIsAttendanceTaken] = useState(false);
  const [isTopicCovered, setIsTopicCovered] = useState(false);
  const [total, setTotal] = useState(0);
  const [present, setPresent] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [topicCovered, setTopicCovered] = useState("");

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/attendance?classId=${classId}`
      );
      if (response.data) {
        const totalCount = response.data.totalStudents || 0;
        const presentCount = response.data.totalPresentStudents || 0;
        setTotal(totalCount);
        setPresent(presentCount);
        const percentagePresent =
          totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(2) : 0;
        setPercentage(percentagePresent);
        setIsAttendanceTaken(true);
      }
    } catch (error) {
      setIsAttendanceTaken(false);
    }
  };

  // fetch the topic covered today in that class
  const fetchTopicCovered = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/topicCovered?classId=${classId}`
      );
      const topic = response.data?.topicsCovered?.[0]?.topic;
      if (topic) {
        setTopicCovered(topic);
        setIsTopicCovered(true);
      } else {
        setTopicCovered("");
        setIsTopicCovered(false);
      }
    } catch (error) {
      setTopicCovered("");
      setIsTopicCovered(false);
    }
  };

  // Fetch attendance data on component mount or when classId changes
  useEffect(() => {
    if (classId) {
      fetchAttendance();
      fetchTopicCovered();
    }
  }, [classId]);

  // Determine card styling based on completion state:
  // - Both done: Dark Slate
  // - 1 done (partial): Soft Amber (Light Mode)
  // - Neither done: Deep Red
  let cardStyle = "border border-red-900 bg-red-900 text-white";
  if (isAttendanceTaken && isTopicCovered) {
    cardStyle = "border border-slate-700 bg-slate-700 text-white";
  } else if (isAttendanceTaken || isTopicCovered) {
    cardStyle = "border-2 border-amber-300 bg-amber-50 text-amber-950 shadow-sm";
  }

  return (
    <div className="lg:w-1/4 md:w-1/2 w-full p-4">
      <div
        className={`rounded-lg min-h-[9rem] p-4 ${cardStyle} font-medium flex flex-col justify-center items-center text-center`}
      >
        <p className="font-bold text-base mb-1">Class {classId}</p>

        {isAttendanceTaken ? (
          <>
            <p className="text-sm">Total Students: {total}</p>
            <p className="text-sm">Total Present Students: {present}</p>
          </>
        ) : (
          <p className="text-sm font-semibold opacity-90">Attendance not taken</p>
        )}

        {isTopicCovered ? (
          <p className="text-sm mt-1">Topic Covered: {topicCovered}</p>
        ) : (
          <p className="text-sm opacity-90">Today's topic not updated</p>
        )}
      </div>
    </div>
  );
};

export default AttendanceBoxes;
