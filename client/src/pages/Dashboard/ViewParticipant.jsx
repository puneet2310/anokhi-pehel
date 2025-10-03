import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import Header from "../../components/Dashboard/Header";
import { useSelector } from "react-redux";
import {
  MdDelete,
  MdEdit,
  MdLocationPin,
  MdClass,
  MdManageSearch,
  MdDownload,
} from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { FaEye } from "react-icons/fa";
import { HiDotsHorizontal } from "react-icons/hi";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { classes, locations } from "../../constants/Dashboard";
import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { BASE_URL } from "../../../src/Service/helper";
import { useNavigate, Link } from "react-router-dom";
import Spinner from "../../components/Spinner.jsx";
import Pagination from "../../components/Dashboard/Pagination.jsx";

const Participants = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => state.user);
  const [isActionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const [isFilterByClassDropdownOpen, setFilterByClassDropdownOpen] =
    useState(false);
  const [isFilterByLocationDropdownOpen, setFilterByLOcationDropdownOpen] =
    useState(false);
  const [isFilterBySessionDropdownOpen, setIsFilterBySessionDropdownOpen] =
    useState(false);
  const [selectedSession, setSelectedSession] = useState([]); // State to hold selected session
  const initialUsers = 40;
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(initialUsers);

  
  //Actions
  const toggleActionsDropdown = () => {
    setActionsDropdownOpen(!isActionsDropdownOpen);
    if (isFilterByClassDropdownOpen)
      setFilterByClassDropdownOpen(!isFilterByClassDropdownOpen);
    if (isFilterByLocationDropdownOpen)
      setFilterByLOcationDropdownOpen(!isFilterByLocationDropdownOpen);
  };

  //filter by class
  const toggleFilterByClassDropdown = () => {
    setFilterByClassDropdownOpen(!isFilterByClassDropdownOpen);
    if (isActionsDropdownOpen) setActionsDropdownOpen(!isActionsDropdownOpen);
    if (isFilterByLocationDropdownOpen)
      setFilterByLOcationDropdownOpen(!isFilterByLocationDropdownOpen);
    if (isFilterBySessionDropdownOpen)
      setIsFilterBySessionDropdownOpen(!isFilterBySessionDropdownOpen);
  };

  //filter by location
  const toggleFilterByLocationDropdown = () => {
    setFilterByLOcationDropdownOpen(!isFilterByLocationDropdownOpen);
    if (isFilterByClassDropdownOpen)
      setFilterByClassDropdownOpen(!isFilterByClassDropdownOpen);
    if (isActionsDropdownOpen) setActionsDropdownOpen(!isActionsDropdownOpen);
  };

  const toggleFilterBySessionDropdown = () => {
    setIsFilterBySessionDropdownOpen(!isFilterBySessionDropdownOpen);
    if (isFilterByClassDropdownOpen)
      setFilterByClassDropdownOpen(!isFilterByClassDropdownOpen);
    if (isActionsDropdownOpen) setActionsDropdownOpen(!isActionsDropdownOpen);
  };
  const [students, setStudents] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterSchool, setFilterSchool] = useState(""); 
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const toggleDropdown = (studentId) => {
    setOpenDropdownId(openDropdownId === studentId ? null : studentId);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${BASE_URL}/participantList`);
        setStudents(response.data);
         console.log(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false); // Set loading state to false once data is fetched
      }
    };
    fetchData();
  }, []);

  // State to hold selected classes
  const [selectedClasses, setSelectedClasses] = useState([]);

  // Update selected classes when a checkbox is clicked
  const handleClassCheckboxChange = (e) => {
    const { id } = e.target;
    const isChecked = e.target.checked;

    if (isChecked) {
      setSelectedClasses((prevSelectedClasses) => [...prevSelectedClasses, id]);
    } else {
      setSelectedClasses((prevSelectedClasses) =>
        prevSelectedClasses.filter((cls) => cls !== id)
      );
    }
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

  // State to hold selected locations
  const [selectedLocations, setSelectedLocations] = useState([]);

  // Update selected locations when a checkbox is clicked
  const handleLocationCheckboxChange = (e) => {
    const { id } = e.target;
    const isChecked = e.target.checked;

    if (isChecked) {
      setSelectedLocations((prevSelectedLocations) => [
        ...prevSelectedLocations,
        id,
      ]);
    } else {
      setSelectedLocations((prevSelectedLocations) =>
        prevSelectedLocations.filter((loc) => loc !== id)
      );
    }
  };

  useEffect(() => {
    // This code block will execute whenever selectedLocations changes
    // console.log("Selected locations updated:", selectedLocations);
  }, [selectedLocations, selectedClasses]); // Adding selectedLocations as a dependency

  // Ensure students is an array, even if it's initially undefined or null
let filteredStudents = Array.isArray(students) ? students : [];

if (selectedLocations.length > 0) {
  filteredStudents = filteredStudents.filter((student) =>
    selectedLocations.includes(student.location)
  );
}

if (selectedClasses.length > 0) {
  filteredStudents = filteredStudents.filter((student) =>
    selectedClasses.includes(student.class)
  );
}

if(selectedSession.length > 0){
  filteredStudents = filteredStudents.filter((student) =>
    selectedSession.includes(student.year)
  );
}

// Filter by student name and school
filteredStudents = filteredStudents.filter((user) => {
  const userName = user.name ? user.name.toLowerCase() : "";
  const schoolName = user.school ? user.school.toLowerCase() : ""; // Add filter by school
  return (
    userName.includes(filterName.toLowerCase()) &&
    schoolName.includes(filterSchool.toLowerCase())
  );
});

let sortedStudents = [...filteredStudents].sort((a, b) => {
  // 1. Sort by year descending
    if (a.year !== b.year) return b.year - a.year;

    // 2. Sort by name descending (Z → A)
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;

  });

// console.log(filteredStudents);


  //Pagination
  // Calculate the indices for the current page
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredStudents.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

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
  const totalPages = Math.ceil(filteredStudents.length / usersPerPage);

  const handleUsersPerPageChange = (e) => {
    setUsersPerPage(Number(e.target.value));
    setCurrentPage(1);
  };
  const handleDownloadTable = () => {
    const doc = new jsPDF();

    doc.autoTable({
      head: [["S.No.","Name", "Class", "Phone", "School", "Year"]],
      body: filteredStudents.map((student,index) => [
        index+1,
        student.name,
        student.class,
        student.phone,
        student.school,
        student.year,
      ]),
    });

    doc.save("students_table.pdf");
  };

  const handleDelete = async (studentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );
    if (confirmDelete) {
      try {
        // Send request to server to delete student
        const response = await axios.delete(
          `${BASE_URL}/deleteParticipants/${studentId}`
        );
        if (response.status === 200) {
          // Student deleted successfully
          alert("Participants deleted successfully");
          navigate("/viewParticipants");
        //   console.log("Student deleted successfully");
          // You can perform any additional actions after successful deletion, such as updating the UI
        } else {
            alert("Participants not deleted successfully");
          // Handle error response from server
          console.error(
            "Failed to delete student:",
            response.status,
            response.statusText
          );
          // You can show an error message to the user or handle the error in any other way
        }
      } catch (error) {
        // Handle network errors or other exceptions
        alert("Participants not deleted successfully");
        console.error("Error deleting student:", error.message);
        // You can show an error message to the user or handle the error in any other way
      }
    }
  };

  return (
    <DashboardLayout>
      {isLoading && <Spinner />}
      <div className="mt-5 p-2 md:p-10 bg-white rounded-3xl">
        <Header category="Antyodaya2k25" title="Participants" />
        <div className="mx-auto max-w-screen-xl">
          <div className="bg-white  relative shadow-md sm:rounded-lg">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
              <div className="w-full md:w-1/2">
                <form className="flex items-center">
                  <label htmlFor="simple-search" className="sr-only">
                    Search
                  </label>
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MdManageSearch />
                    </div>
                    <input
                      type="text"
                      id="simple-search"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full pl-10 p-2"
                      placeholder="Search by name"
                      required=""
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                  </div>
                </form>
              </div>
              <div className="w-full md:w-1/2">
                <form className="flex items-center">
                  <label htmlFor="school-search" className="sr-only">
                    Search
                  </label>
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MdManageSearch />
                    </div>
                    <input
                      type="text"
                      id="school-search"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full pl-10 p-2"
                      placeholder="Search by School"
                      value={filterSchool} // Add search by school value
                      onChange={(e) => setFilterSchool(e.target.value)} // Add search by school onChange
                    />
                  </div>
                </form>
              </div>
              <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                <button
                  onClick={() => {
                    navigate("/addParticipant");
                  }}
                  type="button"
                  className="flex items-center justify-center text-gray-100 bg-cyan-400 hover:bg-cyan-500 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none"
                >
                  <FaPlus />
                  <span className="ml-1">Add Participants</span>
                </button>

                {/* Actions */}
                <button
                  onClick={toggleActionsDropdown}
                  className="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200"
                  type="button"
                >
                  {isActionsDropdownOpen ? (
                    <IoIosArrowUp />
                  ) : (
                    <IoIosArrowDown />
                  )}
                  <span className="mx-1">Download</span>
                </button>
                {/* Dropdown */}
                {isActionsDropdownOpen && (
                  <div className="absolute top-20 mt-20 z-10 w-40 bg-gray-200 rounded-md divide-y divide-gray-300 shadow">
                    <ul className="py-1 text-sm text-gray-700">
                      {/* <li>
                        <a
                          href="#"
                          className="flex py-2 px-4 text-sky-600 hover:bg-sky-200"
                        >
                          <MdEdit className="mt-1" />{" "}
                          <span className="ml-1">Edit</span>
                        </a>
                      </li> */}
                      <li onClick={handleDownloadTable}>
                        <a
                          href="#"
                          className="flex py-2 px-4 text-green-600 hover:bg-green-200"
                        >
                          <MdDownload className="mt-1" />{" "}
                          <span className="ml-1">Download</span>
                        </a>
                      </li>
                    </ul>
                   
                  </div>
                )}

                {/* filter */}
                <div className="flex items-center space-x-3 w-full md:w-auto">
                  {/* Filter By Class*/}
                  <button
                    onClick={toggleFilterByClassDropdown}
                    className="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-700 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200      "
                    type="button"
                  >
                    <MdClass />
                    <span className="mx-1">Filter By Class</span>
                    {isFilterByClassDropdownOpen ? (
                      <IoIosArrowUp />
                    ) : (
                      <IoIosArrowDown />
                    )}
                  </button>
                  <div>
                    {isFilterByClassDropdownOpen && (
                      <div className="absolute right-0 mt-7 p-2 z-10 w-44 bg-gray-200 rounded-md shadow ">
                        <ul className="space-y-2 text-sm h-48 p-2 overflow-y-auto">
                          {classes.map((item, index) => (
                            <li key={index} className="flex items-center">
                              <input
                                id={item.id}
                                type="checkbox"
                                value=""
                                className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500  focus:ring-2"
                                onChange={handleClassCheckboxChange}
                                checked={selectedClasses.includes(item.id)}
                              />
                              <label
                                htmlFor={item.id}
                                className="ml-2 text-sm font-medium text-gray-900"
                              >
                                {item.name}
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={toggleFilterBySessionDropdown}
                    className="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-700 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200      "
                    type="button"
                  >
                    <MdLocationPin />
                    <span className="mx-1">Filter By Session</span>
                    {isFilterBySessionDropdownOpen ? (
                      <IoIosArrowUp />
                    ) : (
                      <IoIosArrowDown />
                    )}
                  </button>
                  
                  <div>
                    {isFilterBySessionDropdownOpen && (
                      <div className="absolute right-0 mt-7 p-2 z-10 w-44 bg-gray-200 rounded-md shadow">
                        <ul className="space-y-2 text-sm">
                          {[2024, 2025].map((year) => (
                            <li key={year} className="flex items-center">
                              <input
                                id={year}
                                type="checkbox"
                                name="session"
                                value={year}
                                className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500  focus:ring-2 outline-none"
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
                 
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 ">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-x border-t">
                  <tr>
                  <th scope="col" className="px-4 py-3">
                      S.No.
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Name
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Class
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Phone
                    </th>
                   
                    <th scope="col" className="px-4 py-3">
                      School
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Year
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {/* <span className="sr-only">Actions</span> */}
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="border-b">
                  {sortedStudents.map((student,index) => (
                    <tr key={student._id} className="border-x">
                    <td className="px-4 py-3">{indexOfFirstUser+index+1}</td>
                      <th
                        scope="row"
                        className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap "
                      >
                        {student.name}
                      </th>
                      <td className="px-4 py-3">{student.class}</td>
                      <td className="px-4 py-3">{student.phone}</td>
                     
                     
                      <td className="px-4 py-3">{student.school}</td>
                      <td className="px-4 py-3">{student.year}</td>

                      <td className="px-4 py-3 flex items-center">
                        <div className="relative inline-block text-left pl-3">
                          <button
                            onClick={() => toggleDropdown(student._id)}
                            className="inline-flex items-center p-0.5 text-xl font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none"
                            type="button"
                          >
                            <HiDotsHorizontal />
                          </button>
                          {/* Dropdown */}
                          {openDropdownId === student._id && (
                            <div className="absolute right-0 z-10 w-30 bg-gray-100 rounded-md divide-y divide-gray-200 shadow">
                              <ul
                                className="py-1 text-sm font-medium"
                                aria-labelledby={`dropdown-button-${student._id}`}
                              >
                                <li>
                                  <Link
                                    to={`/ParticipantProfile?student._id=${student._id}`}
                                    className="flex flex-center py-2 px-4 text-green-600 hover:bg-green-200"
                                  >
                                    <FaEye className="mt-1" />{" "}
                                    <span className="ml-1">View</span>
                                  </Link>
                                </li>
                                {user?.isAdmin === true && (
                                  <li>
                                    <Link
                                      to={`/editParticipant?student._id=${student._id}`}
                                      className="flex flex-center py-2 px-4 text-sky-600 hover:bg-sky-200"
                                    >
                                      <MdEdit className="mt-1" />{" "}
                                      <span className="ml-1">Edit</span>
                                    </Link>
                                  </li>
                                )}
                              </ul>
                              {user?.isAdmin === true && (
                                <div className="py-1">
                                  <button
                                    onClick={() => handleDelete(student._id)}
                                    className="flex flex-center py-2 px-4 text-sm text-red-600 hover:bg-red-100"
                                  >
                                    <MdDelete className="mt-1" />{" "}
                                    <span className="ml-1">Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
              initialUsers={initialUsers}
              usersPerPage={usersPerPage}
              handleUsersPerPageChange={handleUsersPerPageChange}
              totalUsers={filteredStudents.length}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Participants;
