import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../Service/helper";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import { useSelector } from "react-redux";
import PageNotFound from "../Error404";

const Email_Service = () => {
  const [sheetUrl, setSheetUrl] = useState("");
  const [category, setCategory] = useState("");
  const [emailHeader, setEmailHeader] = useState("");
  const [nameHeader, setNameHeader] = useState("");
  const [timeHeader, setTimeHeader] = useState("");
  const [panelHeader, setPanelHeader] = useState("");
  const [dateHeader, setDateHeader] = useState(""); // new state for date header
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [meetupTime, setMeetupTime] = useState("");
  const [venue, setVenue] = useState("");

  const { user } = useSelector((state) => state.user);

  const handleSend = async () => {
    if (
      !sheetUrl ||
      !category ||
      !emailHeader ||
      !nameHeader ||
      (category === "selection" && !selectedDate) ||
      (category === "selection" && !meetupTime)
    ) {
      setMessage("Please fill all required fields before sending.");
      return;
    }
    if (category === "recruitment") {
      if (!timeHeader || !panelHeader || !dateHeader) {
        setMessage("For recruitment mail, please fill all additional fields including date header.");
        return;
      }
    }
    try {
      setLoading(true);
      setMessage("");
      const formattedDate = category === "selection" ? formatLongDate(selectedDate) : null;
      const postData = {
        sheetUrl,
        category,
        emailHeader,
        nameHeader,
        venue,
        ...(category === "selection" && { selectedDate: formattedDate, meetupTime }),
        ...(category === "recruitment" && { timeHeader, panelHeader, dateHeader }),
      };
      const res = await axios.post(`${BASE_URL}/send-mail`, postData);
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage("Error sending emails. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  function formatLongDate(dateString) {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    const getDaySuffix = (d) => {
      if (d > 3 && d < 21) return "th";
      switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
      }
    };
    return `${day}${getDaySuffix(day)} ${month} ${year}`;
  }

  return (
    <>
      {user?.isAdmin === true ? (
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              📧 Email Service
            </h2>
            <input
              type="text"
              placeholder="Paste your Google Spreadsheet public link"
              className="border border-gray-300 rounded-lg p-2 w-full max-w-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
            <select
              className="border border-gray-300 rounded-lg p-2 w-full max-w-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Email Category</option>
              <option value="recruitment">Recruitment</option>
              <option value="selection">Selection Mail</option>
            </select>
            <input
              type="text"
              placeholder="Enter the email column header name (e.g., Email)"
              className="border border-gray-300 rounded-lg p-2 w-full max-w-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={emailHeader}
              onChange={(e) => setEmailHeader(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter the name column header name (e.g., Name)"
              className="border border-gray-300 rounded-lg p-2 w-full max-w-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={nameHeader}
              onChange={(e) => setNameHeader(e.target.value)}
            />
            {/* Datepicker and timepicker only for selection */}
            {category === "selection" && (
              <>
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg p-2 w-full max-w-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={selectedDate}
                  min={today}
                  onChange={e => setSelectedDate(e.target.value)}
                  required
                />
                <input
                  type="time"
                  className="border border-gray-300 rounded-lg p-2 w-full max-w-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={meetupTime}
                  onChange={e => setMeetupTime(e.target.value)}
                  required
                />
              </>
            )}
            {/* Additional inputs for recruitment */}
            {category === "recruitment" && (
              <>
                <input
                  type="text"
                  placeholder="Enter the time column header name (e.g., Interview Time)"
                  className="border border-gray-300 rounded-lg p-2 w-full max-w-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={timeHeader}
                  onChange={(e) => setTimeHeader(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Enter the panel number column header name (e.g., Panel No)"
                  className="border border-gray-300 rounded-lg p-2 w-full max-w-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={panelHeader}
                  onChange={(e) => setPanelHeader(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Enter the date column header name (e.g., Interview Date)"
                  className="border border-gray-300 rounded-lg p-2 w-full max-w-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={dateHeader}
                  onChange={(e) => setDateHeader(e.target.value)}
                />
              </>
            )}
            <input
              type="text"
              placeholder="Enter the venue (e.g., Biotech Lobby)"
              className="border border-gray-300 rounded-lg p-2 w-full max-w-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white font-medium ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Sending..." : "Send Mails"}
            </button>
            {message && (
              <p className="mt-4 text-sm text-gray-700 bg-white p-2 rounded shadow w-full max-w-md text-center">
                {message}
              </p>
            )}
          </div>
        </DashboardLayout>
      ) : (
        <PageNotFound />
      )}
    </>
  );
};

export default Email_Service;
