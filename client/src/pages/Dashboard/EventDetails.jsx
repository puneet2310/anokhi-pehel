import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import Button from "../../components/Dashboard/Button";
import { BASE_URL } from "../../../src/Service/helper";
import { downloadCSV, downloadPDF } from "../../../src/Service/utilityfunctions";

const Student = () => {
  const location = useLocation();
  const currentColor = "#15803d";
  const currentColor1 = "#dc2626";

  let navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const { user } = useSelector((state) => state.user);
  const eventId = searchParams.get("event._id");
  const regNumberCoordinator = searchParams.get("regNumber");
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState(participants);
  const [nameFilter, setNameFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const onClick = async () => {
    try {
      if (eventId) {
        await navigate(`/editEvent?eventId=${eventId}`);
      } else {
        console.log("Event is not available");
      }
    } catch (error) {
      console.error("Error navigating:", error);
    }
  };

  const onClick1 = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (confirmDelete) {
      try {
        const response = await axios.delete(
          `${BASE_URL}/deleteEvent?eventId=${eventId}`
        );
        if (response.status === 200) {
          window.alert("Event deleted successfully");
        } else {
          window.alert("Failed to delete event");
        }
      } catch (error) {
        window.alert("Error deleting event: " + error.message);
      }
    } else {
      window.alert("Event deletion canceled");
    }
  };

  useEffect(() => {
    if (eventId) {
      // Fetch the event by its ID
      axios
        .get(`${BASE_URL}/getEventByEventId?eventId=${eventId}`)
        .then((res) => {
          const eventData = res.data;
          setEvent(eventData);

          // Fetch participants' details using their IDs from the participants array
          const participantIds = eventData.participants || [];
          if (participantIds.length > 0) {
            axios
              .post(`${BASE_URL}/getParticipantsByIds`, { ids: participantIds }) // Ensure this route is set up
              .then((res) => {
                // Sort participants by class before setting state
                const sortedParticipants = res.data.sort((a, b) => a.class.localeCompare(b.class));
                setParticipants(sortedParticipants); // Set the sorted participant data
              })
              .catch((err) => {
                console.error("Error fetching participants: ", err);
              });
          }
        })
        .catch((err) => {
          console.error("Error fetching event: ", err);
        });
    }
  }, [eventId]);

  // Effect to apply filters when nameFilter or classFilter changes
  useEffect(() => {
    const filtered = participants.filter((participant) => {
      // Filter by name (case-insensitive)
      const nameMatches = participant.name.toLowerCase().includes(nameFilter.toLowerCase());
      
      // Filter by class (case-insensitive)
      const classMatches = participant.class.toLowerCase().includes(classFilter.toLowerCase());

      return nameMatches && classMatches; // Return participants matching both filters
    });
    setFilteredParticipants(filtered);
  }, [nameFilter, classFilter, participants]);


  const handleDownloadPDF = () => {
    const columns = [
      { label: "S.No.", key: "index" },
      { label: "Name", key: "name" },
      { label: "Class", key: "class" },
      { label: "School", key: "school" },
      { label: "Contact", key: "phone" }
    ];

    const dataWithIndex = filteredParticipants.map((participant, index) => ({
      ...participant,
      index: index + 1
    }));

    downloadPDF(dataWithIndex, columns, "participants_list", {
      title: "List of Participants for the Event",
      titleFontSize: 18,
      startY: 30
    });
  };



  const handleDownloadParticipantsCSV = () => {
    const columns = [
      { label: "Name", key: "name" },
      { label: "Class", key: "class" },
      { label: "School", key: "school" },
      { label: "Contact", key: "phone" }
    ];

    downloadCSV(filteredParticipants, columns, "participants_list");
  };
  // Function to render the participant details in a table
  const renderParticipantsTable = () => {
    if (participants.length === 0) return <p>No participants found.</p>;

    return (
<div className="overflow-x-auto ml-2 mr-2">
  {/* Heading */}
  <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
    List of Participants for the Event
  </h2>

  {/* Filters - Stacked Vertically on Small Screens */}
  <div className="mb-6 flex flex-col sm:flex-row justify-center items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-6">
  {/* Name Filter */}
  <input
    type="text"
    placeholder="Search by Name"
    value={nameFilter}
    onChange={(e) => setNameFilter(e.target.value)}
    className="border px-4 py-2 rounded-md focus:outline-none text-gray-700 w-full sm:w-auto"
  />

  {/* Class Filter */}
  <input
    type="text"
    placeholder="Search by Class"
    value={classFilter}
    onChange={(e) => setClassFilter(e.target.value)}
    className="border px-4 py-2 rounded-md focus:outline-none text-gray-700 w-full sm:w-auto"
  />
</div>


  {/* Download Buttons - Stacked Vertically on Small Screens */}
  <div className="mb-6 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
    {/* CSV Download Button */}
    <button
      onClick={handleDownloadParticipantsCSV}
      className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none w-full sm:w-auto"
    >
      Download CSV
    </button>

    {/* PDF Download Button */}
    <button
      onClick={handleDownloadPDF}
      className="bg-green-900 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none w-full sm:w-auto"
    >
      Download PDF
    </button>
  </div>

  {/* Table */}

  <table className="w-full text-sm text-left text-gray-500  ">
    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-x border-t">
      <tr className="bg-blue-900 text-white">
        <th scope="col" className="px-4 py-3">S.No.</th>
        <th scope="col" className="px-4 py-3">Name</th>
        <th scope="col" className="px-4 py-3">Class</th>
        <th scope="col" className="px-4 py-3">School</th>
        <th scope="col" className="px-4 py-3">Contact</th>
      </tr>
    </thead>
    <tbody className="border-b">
      {filteredParticipants.map((participant,index) => (
        <tr key={participant._id} className="hover:bg-gray-200">
          <td scope="row" className="px-4 py-3">{index+1}</td>
          <td scope="row" className="px-4 py-3">{participant.name}</td>
          <td scope="row" className="px-4 py-3">{participant.class}</td>
          <td scope="row" className="px-4 py-3">{participant.school}</td>
          <td scope="row" className="px-4 py-3">{participant.phone}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    );
  };

  return (
    <DashboardLayout>
      <div>
        <h2 className="text-2xl font-bold mb-4">Event Details</h2>
        <div className="mentor-profile bg-gray-100 p-4 rounded-lg flex flex-col gap-4">
          {event ? (
            <div className="event-card flex flex-col items-start p-4 border-b border-gray-300 mb-4">
              {/* Left section: General event details */}
              <div className="event-details w-full">
                <h3 className="text-2xl font-bold mb-2 text-center">
                  Details of Event{" "}
                </h3>
                <p>
                  <span className="font-semibold">Event Name:</span>
                  {event.eventName}
                </p>
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {event.location}
                </p>
                <p>
                  <span className="font-semibold">Start Time:</span>{" "}
                  {event.startTime}
                </p>
                <p>
                  <span className="font-semibold">End Time:</span>{" "}
                  {event.endTime}
                </p>
                <h4 className="text-xl font-semibold mb-2 mt-4">
                  Details of Event Coordinator
                </h4>
                <p>
                  <span className="font-semibold">Coordinator:</span>{" "}
                  {event.coordinator}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  <span className="text-blue-600">{event.phone}</span>
                </p>
                <p>
                  <span className="font-semibold">
                    Registration Number of Coordinator:
                  </span>{" "}
                  {event.regNumber}
                </p>
              </div>

              {/* Buttons for Edit and Delete Event */}
              <div className="buttons w-full flex flex-col items-center mt-4">
                <div className="justify-center mb-2">
                  {(user?.isAdmin === true ||
                    user.regnumber === regNumberCoordinator) && (
                    <Button
                      color="white"
                      bgColor={currentColor}
                      text="Edit Event"
                      borderRadius="8px"
                      width="full"
                      height="10px"
                      custumFunc={onClick}
                    />
                  )}
                </div>

                <div className="justify-center">
                  {user?.isAdmin === true && (
                    <Button
                      color="white"
                      bgColor={currentColor1}
                      text="Delete Event"
                      borderRadius="8px"
                      width="full"
                      height="10px"
                      custumFunc={onClick1}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p>No Event data available.</p>
          )}

          {/* Winner Details Section */}
<div className="winner-details w-full p-4 bg-gray-100 rounded-lg shadow-md mt-4">
  <h4 className="text-xl font-semibold mb-4 text-center">
    List of Winners
  </h4>

  {/* Hindi 6 to 8 Winners */}
  {event?.h6to8firstPlace && (
    <div className="winner-category mb-8">
      <h5 className="text-lg font-semibold mb-2 text-center">
        Sub-category: Hindi 6 to 8
      </h5>
      <table className="table-auto w-full border-collapse bg-white rounded-lg shadow-md overflow-hidden">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="px-4 py-2 text-center rounded-tl-lg">Position</th>
            <th className="px-4 py-2 text-center rounded-tr-lg">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-2 text-center">1st Place</td>
            <td className="px-4 py-2 text-center">{event.h6to8firstPlace}</td>
          </tr>
          {event.h6to8secondPlace && (
            <tr>
              <td className="px-4 py-2 text-center">2nd Place</td>
              <td className="px-4 py-2 text-center">{event.h6to8secondPlace}</td>
            </tr>
          )}
          {event.h6to8thirdPlace && (
            <tr>
              <td className="px-4 py-2 text-center">3rd Place</td>
              <td className="px-4 py-2 text-center">{event.h6to8thirdPlace}</td>
            </tr>
          )}
          {event.h6to8fourthPlace && (
            <tr>
              <td className="px-4 py-2 text-center">4th Place</td>
              <td className="px-4 py-2 text-center">{event.h6to8fourthPlace}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )}

  {/* Hindi 9 to 12 Winners */}
  {event?.h9to12firstPlace && (
    <div className="winner-category mb-8">
      <h5 className="text-lg font-semibold mb-2 text-center">
        Sub-category: Hindi 9 to 12
      </h5>
      <table className="table-auto w-full border-collapse bg-white rounded-lg shadow-md overflow-hidden">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="px-4 py-2 text-center rounded-tl-lg">Position</th>
            <th className="px-4 py-2 text-center rounded-tr-lg">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-2 text-center">1st Place</td>
            <td className="px-4 py-2 text-center">{event.h9to12firstPlace}</td>
          </tr>
          {event.h9to12secondPlace && (
            <tr>
              <td className="px-4 py-2 text-center">2nd Place</td>
              <td className="px-4 py-2 text-center">{event.h9to12secondPlace}</td>
            </tr>
          )}
          {event.h9to12thirdPlace && (
            <tr>
              <td className="px-4 py-2 text-center">3rd Place</td>
              <td className="px-4 py-2 text-center">{event.h9to12thirdPlace}</td>
            </tr>
          )}
          {event.h9to12fourthPlace && (
            <tr>
              <td className="px-4 py-2 text-center">4th Place</td>
              <td className="px-4 py-2 text-center">{event.h9to12fourthPlace}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )}

  {/* English 6 to 8 Winners */}
  {event?.e6to8firstPlace && (
    <div className="winner-category mb-8">
      <h5 className="text-lg font-semibold mb-2 text-center">
        Sub-category: English 6 to 8
      </h5>
      <table className="table-auto w-full border-collapse bg-white rounded-lg shadow-md overflow-hidden">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="px-4 py-2 text-center rounded-tl-lg">Position</th>
            <th className="px-4 py-2 text-center rounded-tr-lg">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-2 text-center">1st Place</td>
            <td className="px-4 py-2 text-center">{event.e6to8firstPlace}</td>
          </tr>
          {event.e6to8secondPlace && (
            <tr>
              <td className="px-4 py-2 text-center">2nd Place</td>
              <td className="px-4 py-2 text-center">{event.e6to8secondPlace}</td>
            </tr>
          )}
          {event.e6to8thirdPlace && (
            <tr>
              <td className="px-4 py-2 text-center">3rd Place</td>
              <td className="px-4 py-2 text-center">{event.e6to8thirdPlace}</td>
            </tr>
          )}
          {event.e6to8fourthPlace && (
            <tr>
              <td className="px-4 py-2 text-center">4th Place</td>
              <td className="px-4 py-2 text-center">{event.e6to8fourthPlace}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )}

  {/* English 9 to 12 Winners */}
  {event?.e9to12firstPlace && (
    <div className="winner-category mb-8">
      <h5 className="text-lg font-semibold mb-2 text-center">
        Sub-category: English 9 to 12
      </h5>
      <table className="table-auto w-full border-collapse bg-white rounded-lg shadow-md overflow-hidden">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="px-4 py-2 text-center rounded-tl-lg">Position</th>
            <th className="px-4 py-2 text-center rounded-tr-lg">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-2 text-center">1st Place</td>
            <td className="px-4 py-2 text-center">{event.e9to12firstPlace}</td>
          </tr>
          {event.e9to12secondPlace && (
            <tr>
              <td className="px-4 py-2 text-center">2nd Place</td>
              <td className="px-4 py-2 text-center">{event.e9to12secondPlace}</td>
            </tr>
          )}
          {event.e9to12thirdPlace && (
            <tr>
              <td className="px-4 py-2 text-center">3rd Place</td>
              <td className="px-4 py-2 text-center">{event.e9to12thirdPlace}</td>
            </tr>
          )}
          {event.e9to12fourthPlace && (
            <tr>
              <td className="px-4 py-2 text-center">4th Place</td>
              <td className="px-4 py-2 text-center">{event.e9to12fourthPlace}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )}
</div>

        </div>
      </div>
      {renderParticipantsTable()}

      
    </DashboardLayout>
  );
};

export default Student;
