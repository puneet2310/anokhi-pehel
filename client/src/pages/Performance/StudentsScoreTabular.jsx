import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { BASE_URL } from "../../Service/helper";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

const StudentsScoreTabular = () => {
  const searchParams = new URLSearchParams(useLocation().search);
  const testId = searchParams.get("testId");

  const [testDetails, setTestDetails] = useState([]);
  const [mentorName, setMentorName] = useState("");
  const [subject, setSubject] = useState("");
  const [testDate, setTestDate] = useState("");
  const [className, setClassName] = useState("");
  const [paperLink, setPaperLink] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const fetchTestData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/testsScore?testDate=${testId}`
        );

        // console.log("API Response:", response.data);
        setTestDetails(response.data);

        const mentorName = await axios.get(
          `${BASE_URL}/getMentorByUserId?mentorId=${response.data[0].scores[0].mentorId}`
        );

        // console.log("API Response:", mentorName.data);

        if (response.data.length > 0) {
          setMentorName(mentorName.data.name);  
          setSubject(response.data[0].subject);
          setTestDate(response.data[0].scores[0].date);
          setTotalMarks(response.data[0].scores[0].totalMarks);
          setClassName(response.data[0].className);
          setPaperLink(response.data[0].scores[0].paperLink);

        }
      } catch (error) {
        console.error("Error fetching test details:", error);
      }
    };

    setLoading(false);
    fetchTestData();
  }, [testId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleDownloadTable = () => {
    const doc = new jsPDF();
  
    doc.setFontSize(14);
    doc.text("Test Score Report", 14, 10);
  
    
    doc.setFontSize(10);
    doc.text(`Mentor: ${mentorName}       Class: ${className}       Subject: ${subject}       Test Date: ${formatDate(testDate)}        Total Marks: ${totalMarks}`, 14, 20);
  
    // Prepare table data
    const tableColumn = ["S.No", "Name", "Score"];
    const tableRows = testDetails.map((student, index) => [
      index + 1, 
      student.studentName,
      student.scores[0].score !== -1 ? student.scores[0].score : "Absent",
    ]);
  
    doc.autoTable({
      startY: 30, 
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [44, 62, 80] },
      styles: { fontSize: 10 },
    });
  
    // Save the PDF
    doc.save(`Test_Score_Report_${testId}.pdf`);
  };

  

  return (
    <DashboardLayout>
      <div className="m-2 mt-14 md:m-0 p-2 md:p-7 bg-white rounded-3xl">
        <h2 className="text-center text-xl font-bold tracking-tight text-slate-900">
          Score Card
        </h2>
        <div className="container mt-5">
          <div className="flex flex-col space-y-0 mb-3 md:flex-row md:space-x-3 md:space-y-0">
            <div className="flex-1 flex flex-col">
              <p className="text-lg font-bold mb-2">Mentor: {mentorName}</p>
            </div>
            <div className="flex-1 flex flex-col">
              <p className="text-lg font-bold mb-2">Class: {className}</p>
            </div>
            <div className="flex-1 flex flex-col">
              <p className="text-lg font-bold mb-2">Subject: {subject}</p>
            </div>
            <div className="flex-1 flex flex-col">
              <p className="text-lg font-bold mb-2">Test Date: {formatDate(testDate)}</p>
            </div>
          </div>
          {
            loading ? (
              <p>Loading...</p>
            ) : (
              <div className="overflow-x-auto mt-6">
                <table className="w-full border border-gray-300 shadow-lg rounded-lg">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left border-b border-gray-600">S.No</th>
                      <th className="px-4 py-3 text-left border-b border-gray-600">Name</th>
                      <th className="px-4 py-3 text-left border-b border-gray-600">Score({totalMarks})</th>
                      <th className="px-4 py-3 text-left border-b border-gray-600">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {testDetails.map((student, index) => (
                      <tr key={index} className="hover:bg-gray-100 transition-all">
                        <td className="px-6 py-4 text-gray-900 font-medium">{index + 1}</td>
                        <td className="px-6 py-4">{student.studentName}</td>
                        <td className="px-6 py-4 font-semibold text-gray-700">{student.scores[0].score !== -1 ? student.scores[0].score : "Absent"}</td>
                        <td className="px-6 py-4">
                          <Link to={`/studentProfile?student._id=${student.studentId}`}>
                            <button className=" text-indigo-600  py-1.5 px-4 rounded transition-all">
                              View Profile
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
          <div className="flex justify-center gap-4 mt-10">
            <button
              className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded mt-4"
              onClick={handleDownloadTable}
            >
              Download Table as PDF
            </button>
            <button
              className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded mt-4"
              onClick={paperLink ? () => window.open(paperLink, "_blank") : null}
            >
              View Paper
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentsScoreTabular;
