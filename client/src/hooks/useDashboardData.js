import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { BASE_URL } from "../Service/helper";
import { classes } from "../constants/Dashboard";

export const getLocalDateString = (d = new Date()) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
};

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const useDashboardData = () => {
  const todayString = useMemo(() => getLocalDateString(), []);
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classData, setClassData] = useState([]);

  const isToday = selectedDate === todayString;
  const formattedDisplayDate = useMemo(
    () => formatDisplayDate(selectedDate),
    [selectedDate]
  );
  const formattedDDMMYYYYDate = useMemo(
    () => formatDateDDMMYYYY(selectedDate),
    [selectedDate]
  );

  const handleSetSelectedDate = useCallback(
    (newDate) => {
      if (!newDate) return;
      if (newDate > todayString) {
        setSelectedDate(todayString);
      } else {
        setSelectedDate(newDate);
      }
    },
    [todayString]
  );

  const fetchAllClassData = useCallback(async (dateToFetch = selectedDate) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch lightweight active student counts per class with auth headers
      const token = localStorage.getItem("token");
      const authHeaders = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      let studentCounts = {};
      try {
        const countRes = await axios.get(
          `${BASE_URL}/studentCounts`,
          authHeaders
        );
        studentCounts = countRes.data?.countsByClass || {};
      } catch (err) {
        console.error("Error fetching student counts:", err);
      }

      // 2. Fetch attendance and topic data for each class in parallel for the selected date
      const results = await Promise.all(
        classes.map(async (cls) => {
          const enrolled = studentCounts[cls.id] || 0;
          let isAttendanceTaken = false;
          let total = enrolled;
          let present = 0;
          let percentage = 0;
          let isTopicCovered = false;
          let topicCovered = "";
          let subjectCovered = "";
          let topics = [];

          // Fetch attendance for the specific date
          try {
            const attRes = await axios.get(
              `${BASE_URL}/attendance?classId=${cls.id}&date=${dateToFetch}`,
              authHeaders
            );
            if (attRes.data && typeof attRes.data.totalStudents === "number") {
              total = attRes.data.totalStudents;
              present = attRes.data.totalPresentStudents || 0;
              percentage =
                total > 0 ? Math.round((present / total) * 100) : 0;
              isAttendanceTaken = true;
            }
          } catch (attErr) {
            isAttendanceTaken = false;
          }

          // Fetch topic for the specific date
          try {
            const topicRes = await axios.get(
              `${BASE_URL}/topicCovered?classId=${cls.id}&date=${dateToFetch}`,
              authHeaders
            );
            const topicList = topicRes.data?.topicsCovered || [];
            const validTopics = topicList.filter(
              (t) => t && typeof t.topic === "string" && t.topic.trim().length > 0
            );

            if (validTopics.length > 0) {
              isTopicCovered = true;
              topics = validTopics.map((t) => ({
                topic: t.topic.trim(),
                subject: t.subject ? t.subject.trim() : "",
              }));
              const latest = validTopics[validTopics.length - 1];
              topicCovered = latest.topic.trim();
              subjectCovered = latest.subject ? latest.subject.trim() : "";
            }
          } catch (topicErr) {
            isTopicCovered = false;
          }

          return {
            id: cls.id,
            label: `Class ${cls.name}`,
            enrolled,
            isAttendanceTaken,
            total,
            present,
            percentage,
            isTopicCovered,
            topicCovered,
            subjectCovered,
            topics,
          };
        })
      );

      setClassData(results);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load attendance or class overview data. Please check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchAllClassData(selectedDate);
  }, [fetchAllClassData, selectedDate]);

  const metrics = useMemo(() => {
    const totalEnrolled = classData.reduce(
      (sum, item) => sum + (item.enrolled || 0),
      0
    );
    const totalPresent = classData.reduce(
      (sum, item) => sum + (item.isAttendanceTaken ? item.present : 0),
      0
    );
    const totalMarkedStudents = classData.reduce(
      (sum, item) => sum + (item.isAttendanceTaken ? item.total : 0),
      0
    );
    const classesMarkedCount = classData.filter(
      (item) => item.isAttendanceTaken
    ).length;
    const overallPercentage =
      totalMarkedStudents > 0
        ? Math.round((totalPresent / totalMarkedStudents) * 100)
        : 0;

    return {
      totalEnrolled,
      totalPresent,
      totalMarkedStudents,
      classesMarkedCount,
      overallPercentage,
    };
  }, [classData]);

  return {
    classData,
    loading,
    error,
    refetch: () => fetchAllClassData(selectedDate),
    metrics,
    selectedDate,
    setSelectedDate: handleSetSelectedDate,
    todayString,
    isToday,
    formattedDisplayDate,
    formattedDDMMYYYYDate,
  };
};

export default useDashboardData;

