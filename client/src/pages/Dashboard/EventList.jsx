import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import { BASE_URL } from "../../../src/Service/helper";
import Header from "../../components/Dashboard/Header";
import Button from "../../components/Dashboard/Button";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MdLocationPin,
  MdDownload,
} from "react-icons/md";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Spinner from "../../components/Spinner";

const EventPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [filteredEvents, setFilteredEvents] = useState([]); // State for filtered events
  const [searchEventName, setSearchEventName] = useState(""); // Event name filter state
  const [searchCoordinator, setSearchCoordinator] = useState(""); // Coordinator name filter state
  const [isFilterBySessionDropdownOpen, setIsFilterBySessionDropdownOpen] =
      useState(false);
  const [selectedSession, setSelectedSession] = useState([]);
  const [isActionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  

  let navigate = useNavigate();
  const currentColor = "#03C9D7";
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/getEvents`);
        const sortedEvents = response.data.sort((a, b) =>
          a.eventGroup.localeCompare(b.eventGroup)
        ); // Sort events by eventGroup
        setEvents(sortedEvents); // Set the sorted events
        // setFilteredEvents(sortedEvents); // Initialize filtered events with sorted list
      } catch (error) {
        setError("Failed to fetch events.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // useEffect(() => {
  //   const filtered = events
  //     .filter((event) =>
  //       event.eventName.toLowerCase().includes(searchEventName.toLowerCase()) &&
  //       event.coordinator.toLowerCase().includes(searchCoordinator.toLowerCase())
  //     );
  //   setFilteredEvents(filtered);
  // }, [searchEventName, searchCoordinator, events]);


  if (error) {
    return <div>{error}</div>;
  }

  const toggleFilterBySessionDropdown = () => {
    setIsFilterBySessionDropdownOpen(!isFilterBySessionDropdownOpen);
    if (isFilterBySessionDropdownOpen)
      setIsFilterBySessionDropdownOpen(!isFilterBySessionDropdownOpen);
    if (isActionsDropdownOpen) setActionsDropdownOpen(!isActionsDropdownOpen);
  };

    const toggleActionsDropdown = () => {
      setActionsDropdownOpen(!isActionsDropdownOpen);
      if (isFilterBySessionDropdownOpen)
        setIsFilterBySessionDropdownOpen(!isFilterBySessionDropdownOpen);
    };

  const handleSessionBoxChange = (e) => {
    const { value, checked } = e.target;
    const year = Number(value);

    if (checked) {
      setSelectedSession((prev) => [...prev, year]);
    } else {
      setSelectedSession((prev) => prev.filter((y) => y !== year));
    }
  };

  let filteredEvents = events
      .filter((event) =>
        event.eventName.toLowerCase().includes(searchEventName.toLowerCase()) &&
        event.coordinator.toLowerCase().includes(searchCoordinator.toLowerCase())
      );

  // Before rendering rows
  let sortedEventsList = [...filteredEvents].sort((a, b) => {
  // 1. Sort by year descending
    if (a.year !== b.year) return b.year - a.year;

    // 2. Sort by name descending (Z → A)
    const nameA = a.eventGroup.toLowerCase();
    const nameB = b.eventGroup.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;

    // 3. Sort by startTime descending (latest first)
    return new Date(b.startTime) - new Date(a.startTime);
  });



  if(selectedSession.length > 0){
    sortedEventsList = sortedEventsList.filter((event) =>
      selectedSession.includes(event.year)
    );
  }

  const onClick = () => {
    navigate("/addEvent");
  };

  const handleDownloadTable = () => {
    const doc = new jsPDF();

    doc.autoTable({
      head: [["S.No.","Group", "Name", "Venue", "Start Time", "End Time", "Coordinator", "Phone", "Year"]],
      body: filteredEvents.map((event,index) => [
        index+1,
        event.eventGroup,
        event.eventName,
        event.venue,
        event.startTime,
        event.endTime,
        event.coordinator,
        event.phone,
        event.year
      ]),
    });

    doc.save("Events_list.pdf");
  };

  return (
    <DashboardLayout>
      {loading && <Spinner />}
    <div className="m-2 md:m-5 mt-12 p-2 md:p-0 bg-white rounded-3xl flex flex-row justify-between items-center">
        <Header category="Antyodaya2k25" title="Events" />
        <div>
            {user?.isAdmin === true && (
                <Button
                    color="white"
                    bgColor={currentColor}
                    text="Add Event"
                    borderRadius="8px"
                    width="5px"
                    height="10px"
                    custumFunc={onClick}
                />
            )}
        </div>
    </div>
    <div className="m-2 md:m-0 mt-0 p-2 md:p-7 bg-white rounded-3xl">
        <h2 className="text-center text-xl font-bold tracking-tight text-slate-900 mb-8">
            Event List
        </h2>

        {/* Filter and Action Controls - Enhanced Layout and Styling */}
        <div className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            
            {/* Search Input Group */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                {/* Event Name Search - Good Looking Search Bar */}
                <input
                    type="text"
                    placeholder="Search by Event Name"
                    className="block w-full sm:w-64 bg-gray-50 border border-gray-300 rounded-xl py-2.5 px-4 text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 placeholder-gray-500"
                    value={searchEventName}
                    onChange={(e) => setSearchEventName(e.target.value)}
                />
                {/* Coordinator Search - Good Looking Search Bar */}
                <input
                    type="text"
                    placeholder="Search by Coordinator Name"
                    className="block w-full sm:w-64 bg-gray-50 border border-gray-300 rounded-xl py-2.5 px-4 text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 placeholder-gray-500"
                    value={searchCoordinator}
                    onChange={(e) => setSearchCoordinator(e.target.value)}
                />
            </div>

            {/* Filter and Download Button Group */}
            <div className="flex flex-row gap-3 w-full sm:w-auto">
                
                {/* Filter By Session Button and Dropdown */}
                <div className="relative w-1/2 sm:w-auto">
                    <button
                        onClick={toggleFilterBySessionDropdown}
                        className="w-full flex items-center justify-center py-2.5 px-4 text-sm font-medium text-gray-700 focus:outline-none bg-white rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 transition duration-150 shadow-sm"
                        type="button"
                    >
                        <MdLocationPin className="mr-1" />
                        <span>Session</span>
                        {isFilterBySessionDropdownOpen ? (
                            <IoIosArrowUp className="ml-2" />
                        ) : (
                            <IoIosArrowDown className="ml-2" />
                        )}
                    </button>
                    
                    {isFilterBySessionDropdownOpen && (
                        <div className="absolute right-0 mt-2 p-3 z-20 w-48 bg-white rounded-lg shadow-xl border border-gray-100">
                            <ul className="space-y-2 text-sm">
                                {[2024, 2025].map((year) => (
                                    <li key={year} className="flex items-center">
                                        <input
                                            id={year}
                                            type="checkbox"
                                            name="session"
                                            value={year}
                                            className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded focus:ring-sky-500"
                                            onChange={handleSessionBoxChange}
                                            checked={selectedSession.includes(year)}
                                        />
                                        <label
                                            htmlFor={year}
                                            className="ml-2 text-sm font-medium text-gray-900"
                                        >
                                            {year}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                
                {/* Download Button and Dropdown */}
                <div className="relative w-1/2 sm:w-auto">
                    <button
                        onClick={toggleActionsDropdown}
                        className="w-full flex items-center justify-center py-2.5 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 transition duration-150 shadow-sm"
                        type="button"
                    >
                        <span>Download</span>
                        {isActionsDropdownOpen ? (
                            <IoIosArrowUp className="ml-2" />
                        ) : (
                            <IoIosArrowDown className="ml-2" />
                        )}
                    </button>
                    
                    {isActionsDropdownOpen && (
                        <div className="absolute right-0 mt-2 z-20 w-40 bg-white rounded-lg shadow-xl border border-gray-100">
                            <ul className="py-1 text-sm text-gray-700">
                                <li onClick={handleDownloadTable}>
                                    <a
                                        href="#"
                                        className="flex py-2 px-4 text-green-600 hover:bg-green-50 hover:text-green-700 transition duration-150"
                                    >
                                        <MdDownload className="mt-0.5 mr-1" />
                                        <span>Download Pdf</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 ">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-x border-t">
                    {/* ... (Table head remains the same) ... */}
                    <tr>
                        <th className="px-6 py-4 font-bold">Event Group</th>
                        <th className="px-6 py-4 font-bold">Event Name</th>
                        <th className="px-6 py-4 font-bold">Venue</th>
                        <th className="px-6 py-4 font-bold">Start Time</th>
                        <th className="px-6 py-4 font-bold">End Time</th>
                        <th className="px-6 py-4 font-bold">Coordinator</th>
                        <th className="px-6 py-4 font-bold">Phone</th>
                        <th className="px-6 py-4 font-bold">Year</th>
                        <th className="px-6 py-4 font-bold">Details</th>
                    </tr>
                </thead>
                <tbody>
                    {/* ... (Table body remains the same) ... */}
                    {sortedEventsList.length > 0 ? (
                        sortedEventsList.map((event, index) => (
                            <tr key={index} className="border-b transition hover:bg-gray-50">
                                <td className="border px-6 py-4">{event.eventGroup}</td>
                                <td className="border px-6 py-4">{event.eventName}</td>
                                <td className="border px-6 py-4">{event.location}</td>
                                <td className="border px-6 py-4">{event.startTime}</td>
                                <td className="border px-6 py-4">{event.endTime}</td>
                                <td className="border px-6 py-4">{event.coordinator}</td>
                                <td className="border px-6 py-4">{event.phone}</td>
                                <td className="border px-6 py-4">{event.year}</td>
                                <td className="border px-4 py-2">
                                    <Link to={`/eventManagement?event._id=${event._id}&regNumber=${event.regNumber}`}>
                                        <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-normal hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded transition duration-150">
                                            Details
                                        </button>
                                    </Link>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" className="text-center py-4 text-gray-500">
                                No events found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
</DashboardLayout>
  );
};

export default EventPage;
