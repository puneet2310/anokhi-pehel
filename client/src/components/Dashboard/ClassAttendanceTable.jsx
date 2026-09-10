import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaCalendarCheck, FaSearch, FaCalendarAlt } from "react-icons/fa";
import { useDashboardData } from "../../hooks/useDashboardData";
import { classes } from "../../constants/Dashboard";
import ErrorMessageModel from "../Models/ErrorMessageModel";

const ClassAttendanceTable = () => {
  const navigate = useNavigate();
  const mobileDateInputRef = useRef(null);
  const desktopDateInputRef = useRef(null);
  const {
    classData,
    loading,
    error,
    refetch,
    metrics,
    selectedDate,
    setSelectedDate,
    todayString,
    formattedDDMMYYYYDate,
  } = useDashboardData();
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handlePillClick = (ref) => {
    try {
      if (ref?.current?.showPicker) {
        ref.current.showPicker();
      } else {
        ref?.current?.focus();
      }
    } catch (err) {
      ref?.current?.focus();
    }
  };

  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  const {
    totalEnrolled,
    totalPresent,
    totalMarkedStudents,
    classesMarkedCount,
    overallPercentage,
  } = metrics;

  return (
    <div className="w-full px-2 sm:px-4 md:px-10 pb-10">
      <ErrorMessageModel
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onRetry={() => {
          setShowErrorModal(false);
          refetch();
        }}
        title="Failed to Load Dashboard Data"
        message={error}
      />

      {/* 1. Top Standalone KPI Metric Cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white p-4 rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-sm animate-pulse space-y-2"
            >
              <div className="h-3.5 bg-slate-200 rounded w-20"></div>
              <div className="h-7 bg-slate-200 rounded w-16"></div>
              <div className="h-3 bg-slate-100 rounded w-28"></div>
            </div>
          ))}
        </div>
      ) : (
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
              {classesMarkedCount} / {classes.length}
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
        <div className="p-3 sm:p-4 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          {/* Left Block: Title & Subtitle tightly coupled (mt-0.5) + Date on mobile */}
          <div className="flex items-start justify-between gap-3 w-full md:w-auto">
            <div>
              <h2 className="text-sm sm:text-base md:text-xl font-bold text-slate-800">
                Today's Class Overview
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Live attendance, subject, and topic progress for all classes
              </p>
            </div>

            {/* Date Selector on mobile view (right border, same line as title) */}
            <div className="flex md:hidden items-center shrink-0">
              <div
                onClick={() => handlePillClick(mobileDateInputRef)}
                className="relative inline-flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-xl px-2.5 py-1 shadow-xs transition cursor-pointer shrink-0 select-none"
                title="Select date to load attendance"
              >
                <FaCalendarAlt className="text-indigo-600 text-xs mr-1.5 pointer-events-none" />
                <span className="text-[11px] font-semibold text-slate-500 mr-1 pointer-events-none">
                  Date:
                </span>
                <span className="text-xs font-bold text-slate-700 tracking-wide pointer-events-none">
                  {formattedDDMMYYYYDate}
                </span>
                <input
                  ref={mobileDateInputRef}
                  type="date"
                  value={selectedDate}
                  max={todayString}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    if (!newDate || newDate <= todayString) {
                      setSelectedDate(newDate);
                    }
                  }}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  style={{ border: "none", outline: "none" }}
                  aria-label="Select date"
                />
              </div>
            </div>
          </div>

          {/* Right Block: Date Selector (on desktop) + Action Buttons */}
          <div className="flex flex-col md:items-end gap-2.5 w-full md:w-auto">
            {/* Date Selector on desktop view (right border) */}
            <div className="hidden md:flex items-center shrink-0">
              <div
                onClick={() => handlePillClick(desktopDateInputRef)}
                className="relative inline-flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-xs transition cursor-pointer shrink-0 select-none"
                title="Select date to load attendance"
              >
                <FaCalendarAlt className="text-indigo-600 text-sm mr-2 pointer-events-none" />
                <span className="text-xs font-semibold text-slate-500 mr-1.5 pointer-events-none">
                  Date:
                </span>
                <span className="text-sm font-bold text-slate-700 tracking-wide pointer-events-none">
                  {formattedDDMMYYYYDate}
                </span>
                <input
                  ref={desktopDateInputRef}
                  type="date"
                  value={selectedDate}
                  max={todayString}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    if (!newDate || newDate <= todayString) {
                      setSelectedDate(newDate);
                    }
                  }}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  style={{ border: "none", outline: "none" }}
                  aria-label="Select date"
                />
              </div>
            </div>

            {/* Action Buttons: 2x2 grid on mobile, horizontal row on desktop */}
            <div className="grid grid-cols-2 gap-2 w-full md:w-auto md:flex md:items-center md:gap-2">
              <button
                onClick={() => navigate("/takeAttendance")}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm transition active:scale-95 text-center"
              >
                <FaPlus className="text-[10px]" />
                <span>Take Attendance</span>
              </button>

              <button
                onClick={() => navigate("/addTopic")}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-sm transition active:scale-95 text-center"
              >
                <FaPlus className="text-[10px]" />
                <span>Add Topic</span>
              </button>

              <button
                onClick={() => navigate("/totalAttendance")}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition active:scale-95 border border-slate-200/70 text-center"
                title="Check Monthly Attendance Records"
              >
                <FaCalendarCheck className="text-xs text-slate-500" />
                <span>Check Attendance</span>
              </button>

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
        </div>

        {/* Loading Skeletons matching exact classes length (14 rows) */}
        {loading ? (
          <div>
            {/* Desktop Table Skeleton (14 Rows) */}
            <div className="hidden sm:block p-6 space-y-3">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="h-11 bg-slate-50 border border-slate-100 rounded-xl w-full flex items-center justify-between px-6 animate-pulse"
                >
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                  <div className="h-4 bg-slate-200 rounded w-32"></div>
                  <div className="h-4 bg-slate-200 rounded w-48"></div>
                </div>
              ))}
            </div>

            {/* Mobile Cards Skeleton (14 Cards) */}
            <div className="block sm:hidden p-3 space-y-2.5">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70 space-y-2.5 shadow-sm animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                    <div className="h-4 bg-slate-200 rounded w-16"></div>
                  </div>
                  <div className="h-3 bg-slate-200 rounded w-36"></div>
                  <div className="h-3 bg-slate-200 rounded w-48"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table View (hidden on small mobile screens) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6 w-1/3">Class</th>
                    <th className="py-4 px-6 w-1/3">Present / Total</th>
                    <th className="py-4 px-6 w-1/3">
                      Subject & Topic Covered Today
                    </th>
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

                      {/* 3. Subject & Topic Covered Today */}
                      <td className="py-4 px-6 break-words [overflow-wrap:anywhere] whitespace-normal">
                        {item.isTopicCovered ? (
                          <div className="space-y-2">
                            {item.topics && item.topics.length > 0 ? (
                              item.topics.map((t, idx) => {
                                const isLongTopic =
                                  t.topic && t.topic.trim().length > 25;
                                return (
                                  <div
                                    key={idx}
                                    className={`min-w-0 ${
                                      isLongTopic
                                        ? "flex flex-col items-start gap-1"
                                        : "flex flex-wrap items-center gap-1.5"
                                    }`}
                                  >
                                    {t.subject && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                                        {t.subject}
                                      </span>
                                    )}
                                    <span
                                      className="font-medium text-slate-800 text-sm md:text-base leading-snug break-words [overflow-wrap:anywhere] whitespace-normal"
                                      title={t.topic}
                                    >
                                      {t.topic}
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              (() => {
                                const isLongTopic =
                                  item.topicCovered &&
                                  item.topicCovered.trim().length > 25;
                                return (
                                  <div
                                    className={`min-w-0 ${
                                      isLongTopic
                                        ? "flex flex-col items-start gap-1"
                                        : "flex flex-wrap items-center gap-1.5"
                                    }`}
                                  >
                                    {item.subjectCovered && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                                        {item.subjectCovered}
                                      </span>
                                    )}
                                    <span
                                      className="font-medium text-slate-800 text-sm md:text-base leading-snug break-words [overflow-wrap:anywhere] whitespace-normal"
                                      title={item.topicCovered}
                                    >
                                      {item.topicCovered}
                                    </span>
                                  </div>
                                );
                              })()
                            )}
                          </div>
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
                      {classesMarkedCount} of {classes.length} classes recorded
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

                  {/* Subject & Topic Covered Section */}
                  {item.isTopicCovered ? (
                    <div className="text-xs pt-1.5 border-t border-slate-200/50 space-y-1.5">
                      {item.topics && item.topics.length > 1 ? (
                        <div className="space-y-1.5">
                          <span className="text-slate-500 font-medium block">
                            Topics Covered
                          </span>
                          {item.topics.map((t, idx) => (
                            <div
                              key={idx}
                              className="bg-white/80 p-2 rounded-lg border border-slate-200/60 space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                {t.subject && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    {t.subject}
                                  </span>
                                )}
                              </div>
                              <div className="break-words leading-relaxed text-slate-800 font-medium">
                                {t.topic}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">
                              Topic Covered
                            </span>
                            {(item.topics?.[0]?.subject || item.subjectCovered) && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {item.topics?.[0]?.subject || item.subjectCovered}
                              </span>
                            )}
                          </div>
                          <div className="break-words leading-relaxed text-slate-800 font-medium">
                            {item.topics?.[0]?.topic || item.topicCovered}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50">
                      <span className="text-slate-500 font-medium">
                        Topic Covered
                      </span>
                      <span className="italic text-slate-400 font-normal">
                        Not Added
                      </span>
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


