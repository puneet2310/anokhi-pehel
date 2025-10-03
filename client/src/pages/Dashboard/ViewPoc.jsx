import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Dashboard/Header";
import { BASE_URL } from "../../../src/Service/helper";
import { useSelector } from "react-redux";
import {
  MdLocationPin,
  MdDownload,
} from "react-icons/md";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ViewPocList = () => {
  const [pocList, setPocList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterBySessionDropdownOpen, setIsFilterBySessionDropdownOpen] =
    useState(false);
  const [selectedSession, setSelectedSession] = useState([]);
  const [isActionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const { user } = useSelector((state) => state.user);
  useEffect(() => {
    const fetchPocData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/pocList`);
        setPocList(response.data);
      } catch (error) {
        console.error("Error fetching POC details:", error);
      }
    };

    fetchPocData();
  }, []);

  // Function to handle the search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

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

  // Filter POC list based on search term
  let filteredPocList = pocList.filter((poc) => {
    return (
      poc.nameOfPoc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poc.school.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  let sortedPocList = [...filteredPocList].sort((a, b) => {
  // 1. Sort by year descending
    if (a.year !== b.year) return b.year - a.year;

    // 2. Sort by name descending (Z → A)
    const nameA = a.nameOfPoc.toLowerCase();
    const nameB = b.nameOfPoc.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;

  });

  if(selectedSession.length > 0){
    sortedPocList = sortedPocList.filter((poc) =>
      selectedSession.includes(poc.year)
    );
  }

  // Function to delete a POC
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/pocList/${id}`);
      // Update local state to remove deleted POC
      setPocList(pocList.filter((poc) => poc._id !== id));
    } catch (error) {
      console.error("Error deleting POC:", error);
    }
  };

  const handleDownloadTable = () => {
    const doc = new jsPDF();

    doc.autoTable({
      head: [["S.No.","Name", "Contact No.", "School", "Year"]],
      body: filteredPocList.map((poc,index) => [
        index+1,
        poc.nameOfPoc,
        poc.contact,
        poc.school,
        poc.year,
      ]),
    });

    doc.save("poc_list.pdf");
  };

  return (
    <DashboardLayout>
      <div className="m-2 md:m-5 mt-12 p-2 md:p-0 bg-white rounded-3xl flex flex-row justify-between items-center">
        <Header category="Antyodaya2k25" title="Point of Contact of Schools" />
      </div>
      <div className="m-2 md:m-0 mt-0 p-2 md:p-7 bg-white rounded-3xl">
        <h2 className="text-center text-xl font-bold tracking-tight text-slate-900">
          POC List
        </h2>
        
        {/* Search Input, Filters, and Download Buttons */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Input - Improved Styling */}
          <input
            type="text"
            placeholder="Search by Name or School"
            value={searchTerm}
            onChange={handleSearchChange}
            // Enhanced Styling:
            className="block w-full md:w-80 bg-gray-50 border border-gray-300 rounded-xl py-2.5 px-4 text-gray-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 placeholder-gray-500"
          />

          {/* Button Group for Filters and Actions */}
          <div className="flex flex-row space-x-3 relative">
            
            {/* Filter By Session Button and Dropdown */}
            <div className="relative">
              <button
                onClick={toggleFilterBySessionDropdown}
                className="flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-700 focus:outline-none bg-white rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 transition duration-150"
                type="button"
              >
                <MdLocationPin className="mr-1" />
                <span>Filter By Session</span>
                {isFilterBySessionDropdownOpen ? (
                  <IoIosArrowUp className="ml-2" />
                ) : (
                  <IoIosArrowDown className="ml-2" />
                )}
              </button>
              
              {isFilterBySessionDropdownOpen && (
                <div className="absolute right-0 mt-2 p-3 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-100">
                  <ul className="space-y-2 text-sm">
                    {[2024, 2025].map((year) => (
                      <li key={year} className="flex items-center">
                        <input
                          id={year}
                          type="checkbox"
                          name="session"
                          value={year}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
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
            <div className="relative">
              <button
                onClick={toggleActionsDropdown}
                className="flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 transition duration-150"
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
                <div className="absolute right-0 mt-2 z-20 w-40 bg-white rounded-lg shadow-lg border border-gray-100">
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
        
        {/* Table remains the same */}
        <table className="w-full text-sm text-left text-gray-900 rounded-lg overflow-hidden border-collapse">
          <thead className="text-xs text-gray-900 uppercase bg-gray-50 border-t">
            <tr>
              <th className="border px-4 py-3">Name of POC</th>
              <th className="border px-4 py-3">Contact</th>
              <th className="border px-4 py-3">School</th>
              <th className="border px-4 py-3">Year</th>
              {user?.isAdmin === true && (
              <th className="border px-4 py-3">Actions</th> 
            )}
            </tr>
          </thead>
          <tbody>
            {sortedPocList.map((poc) => (
              <tr key={poc._id} className="hover:bg-gray-50 transition duration-100">
                <td className="border px-4 py-2">{poc.nameOfPoc}</td>
                <td className="border px-4 py-2">{poc.contact}</td>
                <td className="border px-4 py-2">{poc.school}</td>
                <td className="border px-4 py-2">{poc.year}</td>
                
                {/* Conditionally render admin actions column */}
                {user?.isAdmin === true && (
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleDelete(poc._id)}
                      className="text-red-600 hover:text-red-800 transition duration-150 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default ViewPocList;
