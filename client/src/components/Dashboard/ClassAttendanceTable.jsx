import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../Service/helper";
import { FaPlus, FaCalendarCheck, FaSearch } from "react-icons/fa";

const CLASS_LIST = [
  { id: "Nursery", label: "Class Nursery" },
  { id: "1", label: "Class 1" },
  { id: "2", label: "Class 2" },
  { id: "3", label: "Class 3" },
  { id: "4", label: "Class 4" },
  { id: "5", label: "Class 5" },
  { id: "Navodaya", label: "Class Navodaya" },
  { id: "6", label: "Class 6" },
  { id: "7", label: "Class 7" },
  { id: "8", label: "Class 8" },
  { id: "9", label: "Class 9" },
  { id: "10", label: "Class 10" },
  { id: "11", label: "Class 11" },
  { id: "12", label: "Class 12" },
];

const ClassAttendanceTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState([]);

  useEffect(() => {
    const fetchAllClassData = async () => {
      setLoading(true);
      try {
        // 1. Fetch all students to compute enrolled count per class
        let studentCounts = {};
        try {
          const studentRes = await axios.get(`${BASE_URL}/studentList`);
          if (Array.isArray(studentRes.data)) {
            studentRes.data.forEach((student) => {
              if (student.active !== false && student.className) {
                studentCounts[student.className] =
                  (studentCounts[student.className] || 0) + 1;
              }
            });
          }
        } catch (err) {
          console.error("Error fetching student list:", err);
        }

        // 2. Fetch attendance and topic data for each class in parallel
        const results = await Promise.all(
          CLASS_LIST.map(async (cls) => {
            const enrolled = studentCounts[cls.id] || 0;
            let isAttendanceTaken = false;
            let total = enrolled;
            let present = 0;
            let percentage = 0;
            let isTopicCovered = false;
            let topicCovered = "";

            // Fetch attendance
            try {
              const attRes = await axios.get(
                `${BASE_URL}/attendance?classId=${cls.id}`
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
                `${BASE_URL}/topicCovered?classId=${cls.id}`
              );
              const topic = topicRes.data?.topicsCovered?.[0]?.topic;
              if (topic) {
                topicCovered = topic;
                isTopicCovered = true;
              }
            } catch (topicErr) {
              isTopicCovered = false;
            }

            return {
              id: cls.id,
              label: cls.label,
              enrolled,
              isAttendanceTaken,
              total,
              present,
              percentage,
              isTopicCovered,
              topicCovered,
            };
          })
        );

        setClassData(results);
      } catch (error) {
        console.error("Error fetching class dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllClassData();
  }, []);

  const totalEnrolled = classData.reduce((sum, item) => sum + (item.enrolled || 0), 0);
  const totalPresent = classData.reduce((sum, item) => sum + (item.isAttendanceTaken ? item.present : 0), 0);
  const totalMarkedStudents = classData.reduce((sum, item) => sum + (item.isAttendanceTaken ? item.total : 0), 0);
  const classesMarkedCount = classData.filter((item) => item.isAttendanceTaken).length;
  const overallPercentage = totalMarkedStudents > 0 ? Math.round((totalPresent / totalMarkedStudents) * 100) : 0;

  return (
    <div className="w-full px-2 md:px-10 pb-10">
      {/* 1. Top Standalone KPI Metric Cards */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm">
            <span className="text-slate-500 font-medium text-xs block">
              Total Students
            </span>
            <span className="text-xl md:text-2xl font-bold text-slate-800 mt-1 block">
              {totalEnrolled}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Enrolled across all classes
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm">
            <span className="text-slate-500 font-medium text-xs block">
              Total Present
            </span>
            <span className="text-xl md:text-2xl font-bold text-emerald-700 mt-1 block">
              {totalPresent}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {totalMarkedStudents > 0
                ? `of ${totalMarkedStudents} marked`
                : "Attendance not taken yet"}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm">
            <span className="text-slate-500 font-medium text-xs block">
              Overall Presence
            </span>
            <span className="text-xl md:text-2xl font-bold text-emerald-700 mt-1 block">
              {totalMarkedStudents > 0 ? `${overallPercentage}%` : "--"}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Average attendance rate
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm">
            <span className="text-slate-500 font-medium text-xs block">
              Classes Marked
            </span>
            <span className="text-xl md:text-2xl font-bold text-indigo-700 mt-1 block">
              {classesMarkedCount} / {CLASS_LIST.length}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Classes recorded today
            </span>
          </div>
        </div>
      )}

      {/* 2. Today's Class Overview Table Container */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Table Header Controls / Title & Actions Toolbar */}
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800">
              Today's Class Overview
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Live attendance and topic progress for all classes
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full lg:w-auto lg:flex lg:items-center lg:gap-2">
            {/* 1. Take Attendance (Primary Action) */}
            <button
              onClick={() => navigate("/takeAttendance")}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm transition active:scale-95 text-center"
            >
              <FaPlus className="text-[10px]" />
              <span>Take Attendance</span>
            </button>

            {/* 2. Add Topic (Primary Action) */}
            <button
              onClick={() => navigate("/addTopic")}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm transition active:scale-95 text-center"
            >
              <FaPlus className="text-[10px]" />
              <span>Add Topic</span>
            </button>

            {/* 3. Check Attendance (Secondary View) */}
            <button
              onClick={() => navigate("/totalAttendance")}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition active:scale-95 border border-slate-200/70 text-center"
              title="Check Monthly Attendance Records"
            >
              <FaCalendarCheck className="text-xs text-slate-500" />
              <span>Check Attendance</span>
            </button>

            {/* 4. View Topics (Secondary View) */}
            <button
              onClick={() => navigate("/findTopic")}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition active:scale-95 border border-slate-200/70 text-center"
              title="Search Topics Covered"
            >
              <FaSearch className="text-xs text-slate-500" />
              <span>View Topics</span>
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-12 bg-slate-100 rounded-lg w-full flex items-center justify-between px-4"
              >
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-4 bg-slate-200 rounded w-28"></div>
                <div className="h-4 bg-slate-200 rounded w-48"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table View (hidden on small mobile screens) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6 w-1/3">Class</th>
                    <th className="py-4 px-6 w-1/3">Present / Total</th>
                    <th className="py-4 px-6 w-1/3">Topic Covered Today</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classData.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* 1. Class */}
                      <td className="py-4 px-6 font-bold text-slate-900 text-sm md:text-base whitespace-nowrap">
                        {item.label}
                      </td>

                      {/* 2. Present / Total */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {item.isAttendanceTaken ? (
                          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5">
                            <span className="font-bold text-emerald-700 text-sm md:text-base">
                              {item.present} / {item.total}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 inline-block w-fit">
                              ({item.percentage}%)
                            </span>
                          </div>
                        ) : (
                          <span className="italic text-slate-400 font-normal text-sm md:text-base">
                            Not Marked
                          </span>
                        )}
                      </td>

                      {/* 3. Topic Covered Today */}
                      <td className="py-4 px-6 break-words max-w-xs md:max-w-md">
                        {item.isTopicCovered ? (
                          <span
                            className="font-medium text-slate-800 text-sm md:text-base"
                            title={item.topicCovered}
                          >
                            {item.topicCovered}
                          </span>
                        ) : (
                          <span className="italic text-slate-400 font-normal text-sm md:text-base">
                            Not Added
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Table Footer: Total Summary */}
                <tfoot className="bg-slate-50/90 border-t-2 border-slate-200/90 text-xs font-bold text-slate-800">
                  <tr>
                    <td className="py-4 px-6 font-bold text-slate-900 text-sm">
                      Total (All Classes)
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {classesMarkedCount > 0 ? (
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5">
                          <span className="font-bold text-emerald-700 text-sm md:text-base">
                            {totalPresent} / {totalMarkedStudents}
                          </span>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 inline-block w-fit">
                            ({overallPercentage}%)
                          </span>
                        </div>
                      ) : (
                        <span className="italic text-slate-400 font-normal text-sm">
                          -- / {totalEnrolled}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium text-xs md:text-sm">
                      {classesMarkedCount} of {CLASS_LIST.length} classes recorded
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile View: Clean Card Layout (< 640px) */}
            <div className="block sm:hidden divide-y divide-slate-100 p-2 space-y-2">
              {classData.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50/60 rounded-xl p-3.5 border border-slate-200/70 space-y-2.5 shadow-sm"
                >
                  {/* Top Bar: Class Name */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-base">
                      {item.label}
                    </span>
                    {item.isAttendanceTaken && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        {item.percentage}% Present
                      </span>
                    )}
                  </div>

                  {/* Attendance Stats Row */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50">
                    <span className="text-slate-500 font-medium">
                      Attendance
                    </span>
                    {item.isAttendanceTaken ? (
                      <span className="font-bold text-emerald-700">
                        {item.present} / {item.total}
                      </span>
                    ) : (
                      <span className="italic text-slate-400 font-normal">
                        Not Marked
                      </span>
                    )}
                  </div>

                  {/* Topic Covered Section (Adaptive: 1-line for short/empty text, 2-line block for longer descriptions) */}
                  {item.isTopicCovered && item.topicCovered.trim().length > 20 ? (
                    <div className="text-xs pt-1.5 border-t border-slate-200/50 space-y-1">
                      <span className="text-slate-500 font-medium block">
                        Topic Covered
                      </span>
                      <div className="break-words leading-relaxed text-slate-800 font-medium">
                        {item.topicCovered}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50">
                      <span className="text-slate-500 font-medium">
                        Topic Covered
                      </span>
                      {item.isTopicCovered ? (
                        <span className="font-medium text-slate-800 text-right">
                          {item.topicCovered}
                        </span>
                      ) : (
                        <span className="italic text-slate-400 font-normal">
                          Not Added
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClassAttendanceTable;

