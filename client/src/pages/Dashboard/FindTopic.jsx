import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { classes, months, subjects } from "../../constants/Dashboard";
import { BASE_URL } from "../../../src/Service/helper";
import { useSelector } from "react-redux";
import Pagination from "../../components/Dashboard/Pagination";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";


// assuming our session starts from 1st April to 31st March
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();

const currentSessionStartYear =
  currentMonth >= 3 ? currentYear : currentYear - 1;

const currentSession = `${currentSessionStartYear}-${currentSessionStartYear + 1}`;

// getting session from 2018-2019 to current session
const sessions = Array.from(
  { length: currentSessionStartYear - 2018 + 1 },
  (_, index) => {
    const startYear = currentSessionStartYear - index;
    return `${startYear}-${startYear + 1}`;
  }
);
const getSessionFromDate = (date) => {
  const topicDate = new Date(date);

  const year = topicDate.getFullYear();
  const month = topicDate.getMonth();

  // April = 3
  if (month >= 3) {
    return `${year}-${year + 1}`;
  }

  return `${year - 1}-${year}`;
};

const FindTopic = () => {
  const navigate = useNavigate();
  const initialTopics = 10;
  const { user } = useSelector((state) => state.user);
  const [errors, setErrors] = useState({});
  const [credentials, setCredentials] = useState({
    classId: "",
    subject: "",
  });
  const [topics, setTopics] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [topicsPerPage, setTopicsPerPage] = useState(initialTopics);
  const [session, setSession] = useState([currentSession]);
  const [isSessionDropdownOpen, setIsSessionDropdownOpen] = useState(false);
  const [filterdTopic, setFilteredTopic] = useState([]);
  const sessionDropdownRef = useRef(null);
  const onChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    if (name === "classId") {
      fetchTopicCovered(value, credentials.subject);
    }
    if (name === "subject") {
      fetchTopicCovered(credentials.classId, value);
    }
    setTopicsPerPage(initialTopics);
    setCurrentPage(1);
  };
  const onsessionChange = (selectedSession) => {
    let updatedSessions;

    if (session.includes(selectedSession)) {
      updatedSessions = session.filter(
        (item) => item !== selectedSession
      );
    } else {
      updatedSessions = [...session, selectedSession];
    }

    setSession(updatedSessions);
    setCurrentPage(1);

    if (updatedSessions.length === 0) {
      setFilteredTopic([]);
      return;
    }

    const sessionFilteredTopic = topics.filter((topic) => {
      const topicDate = new Date(topic.date);

      return updatedSessions.some((selectedSession) => {
        const [startYear, endYear] = selectedSession
          .split("-")
          .map(Number);

        const startDate = new Date(startYear, 3, 1);
        const endDate = new Date(endYear, 3, 1);

        return topicDate >= startDate && topicDate < endDate;
      });
    });

    setFilteredTopic(sessionFilteredTopic);
  };

  const handleSelectAllSessions = (e) => {
    if (e.target.checked) {
      setSession([...sessions]);
      setFilteredTopic(topics);
    } else {
      setSession([]);
      setFilteredTopic([]);
    }

    setCurrentPage(1);
  };
  const fetchTopicCovered = async (classId, subject) => {
    try {
      const response = await axios.get(`${BASE_URL}/topics`, {
        params: {
          classId,
          subject,
        },
      });
      // console.log(response.data);
      const { topics: receivedTopics } = response.data;
      const sortedTopics = receivedTopics.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      ); // Sorting by date
      if (Array.isArray(sortedTopics)) {
        setTopics(sortedTopics);
        const topicsWithMentorNames = await Promise.all(
          sortedTopics.map(async (topic) => {
            try {
              const mentorResponse = await axios.get(
                `${BASE_URL}/getMentorByUserId?mentorId=${topic.mentorId}`
              );
              const mentorName = mentorResponse.data.name; // Assuming 'name' is the field containing the mentor's name

              return {
                ...topic,
                mentorName: mentorName || "Unknown",
              };
            } catch (error) {
              console.error("Error fetching mentor:", error);
              return {
                ...topic,
                mentorName: "Unknown",
              };
            }
          })
        );

        setTopics(topicsWithMentorNames);

        const currentSessionTopics = topicsWithMentorNames.filter((topic) => {
          return getSessionFromDate(topic.date) === currentSession;
        });

        setFilteredTopic(currentSessionTopics);
        setSession([currentSession]);
      } else {
        setTopics([]);
        setFilteredTopic([]);
        setSession([currentSession]);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      setTopics([]); // Reset topics on error
      setFilteredTopic([]);
      setSession([currentSession]);
    }
  };

  // Calculate the indices for the current page
  const indexOfLastTopic = currentPage * topicsPerPage;
  const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;
  const currentTopics = filterdTopic.slice(indexOfFirstTopic, indexOfLastTopic);

  // Function to handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  // Calculate total pages
  const totalPages = Math.ceil(filterdTopic.length / topicsPerPage);

  const handleUsersPerPageChange = (e) => {
    setTopicsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sessionDropdownRef.current &&
        !sessionDropdownRef.current.contains(event.target)
      ) {
        setIsSessionDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <form encType="multipart/form-data">
          <div className="space-y-8">
            <div className="border-b border-gray-900/10 pb-8">
              <h2 className="text-base font-bold leading-7 text-gray-900">
                All Topic Covered
              </h2>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-2 sm:col-start-1">
                  <label
                    htmlFor="class"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Subject
                  </label>
                  <div className="mt-2">
                    <select
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                      name="subject"
                      placeholder="Subject"
                      value={credentials.subject}
                      onChange={onChange}
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((item, index) => (
                        <option key={index} value={item.id}>
                          {item.subject}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="region"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Class
                  </label>
                  <div className="mt-2">
                    <select
                      name="classId"
                      id="classId"
                      value={credentials.classId}
                      onChange={onChange}
                      placeholder="Class"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                    >
                      <option value="">Select a class</option>
                      {classes.map((item, index) => (
                        <option key={index} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-2 relative" ref={sessionDropdownRef}>
                  <label
                    htmlFor="session"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Academic Session
                  </label>

                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setIsSessionDropdownOpen(!isSessionDropdownOpen)}
                      className="block w-full rounded-md border-0 py-1.5 px-3 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6 bg-white"
                    >
                      <div className="flex items-center justify-between">
                        <span>
                          {session.length === 0
                            ? "Select Session"
                            : session.length === 1
                              ? session[0]
                              : `${session.length} Sessions Selected`}
                        </span>

                        <span>
                          {isSessionDropdownOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                        </span>
                      </div>
                    </button>

                    {isSessionDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full sm:max-w-xs bg-white rounded-md shadow-lg ring-1 ring-gray-300">
                        <ul className="space-y-2 text-sm max-h-48 p-3 overflow-y-auto">
                          <li className="flex items-center">
                            <input
                              id="select-all-sessions"
                              type="checkbox"
                              checked={session.length === sessions.length}
                              onChange={handleSelectAllSessions}
                              className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                            />

                            <label
                              htmlFor="select-all-sessions"
                              className="ml-2 text-sm font-medium text-gray-900 cursor-pointer"
                            >
                              Select All
                            </label>
                          </li>
                          {sessions.map((item) => (
                            <li key={item} className="flex items-center">
                              <input
                                id={`session-${item}`}
                                type="checkbox"
                                checked={session.includes(item)}
                                onChange={() => onsessionChange(item)}
                                className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-2"
                              />

                              <label
                                htmlFor={`session-${item}`}
                                className="ml-2 text-sm font-medium text-gray-900 cursor-pointer"
                              >
                                {item}
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mt-6">
                Topics Covered in Class {credentials.classId} -{" "}
                {credentials.subject}
              </h3>
              <ul className="mt-4">
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-800 text-white">
                      <th className="py-2 px-4">S.No</th>
                      <th className="py-2 px-4">Date</th>
                      <th className="py-2 px-4">Topic</th>
                      <th className="py-2 px-4">Mentor</th>
                      <th className="py-2 px-4">Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTopics.map((topic, index) => (
                      <tr
                        key={topic._id}
                        className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
                      >
                        <td className="py-2 px-4">{index + 1}</td>
                        <td className="py-2 px-4">
                          {topic.date.split("-")[2].split("T")[0]}{" "}
                          {
                            months.find(
                              (m) => m.value === topic.date.split("-")[1]
                            )?.label
                          }{" "}
                          {topic.date.split("-")[0]}
                        </td>
                        <td className="py-2 px-4">{topic.topic}</td>
                        <td className="py-2 px-4">{topic.mentorName}</td>

                        <td className="py-2 px-4">
                          {getSessionFromDate(topic.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ul>
            </div>
          </div>
        </form>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          initialUsers={initialTopics}
          usersPerPage={topicsPerPage}
          handleUsersPerPageChange={handleUsersPerPageChange}
          totalUsers={filterdTopic.length}
        />
      </div>
    </DashboardLayout>
  );
};

export default FindTopic;
