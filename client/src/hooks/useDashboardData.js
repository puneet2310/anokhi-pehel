import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { BASE_URL } from "../Service/helper";
import { classes } from "../constants/Dashboard";

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classData, setClassData] = useState([]);

  const fetchAllClassData = useCallback(async () => {
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

      // 2. Fetch attendance and topic data for each class in parallel
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

          // Fetch attendance
          try {
            const attRes = await axios.get(
              `${BASE_URL}/attendance?classId=${cls.id}`,
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

          // Fetch topic
          try {
            const topicRes = await axios.get(
              `${BASE_URL}/topicCovered?classId=${cls.id}`,
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
  }, []);

  useEffect(() => {
    fetchAllClassData();
  }, [fetchAllClassData]);

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
    refetch: fetchAllClassData,
    metrics,
  };
};

export default useDashboardData;
