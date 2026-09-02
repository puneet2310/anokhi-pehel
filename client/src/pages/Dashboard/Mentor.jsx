import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import Header from "../../components/Dashboard/Header";
import Button from "../../components/Dashboard/Button";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../Service/helper";
import { downloadPDF } from "../../Service/utilityfunctions";
import { useSelector } from "react-redux";
import { MdManageSearch } from "react-icons/md";
import Spinner from "../../components/Spinner.jsx";
import Pagination from "../../components/Dashboard/Pagination.jsx";
import { ROLES } from "../../constants/Dashboard/index.jsx";

const Mentor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAcceptingResponse, setIsAcceptingResponse] = useState(false);

  const currentColor = "#03C9D7";
  let navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const onClick = () => {
    navigate("/AddMentors7282vdsghbhdghd");
  };
  const initialUsers = 15; //initial number of users per page

  //Mentors
  const [users, setMentors] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterRegnumber, setFilterRegnumber] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(initialUsers);
  const [inActiveUsers, setInActiveUsers] = useState([]);
  //Fetch mentor and Alumni data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${BASE_URL}/teamList`);
        const mentors = response.data.filter(
          (mentor) => mentor.role != ROLES.ALUMNI && mentor.isActive
        );
        setMentors(mentors);
        // console.log(users);
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchInActiveUsers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${BASE_URL}/getInactiveUsers`);

        setInActiveUsers(response.data);
        // console.log(users);
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInActiveUsers();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/settings`);
        if (response.data) {
          const setting = response.data.find(
            (item) => item.key === "isAcceptingResponse"
          );
          if (setting) {
            setIsAcceptingResponse(setting.value); // Set the fetched setting value
            console.log(isAcceptingResponse);
          }
        }
      } catch (error) {
        console.error("Error fetching settings", error);
      }
    };
    fetchSettings();
  }, []);
  // Handle toggle change
  const handleToggle = async (checked) => {
    const updatedValue = !isAcceptingResponse;
    setIsAcceptingResponse(updatedValue);
    //setIsAcceptingResponse(checked);
    try {
      // Send the updated setting value to the backend
      await axios.post(`${BASE_URL}/updateSettings`, {
        key: "isAcceptingResponse",
        value: updatedValue,
      });
      //setIsAcceptingResponse(!isAcceptingResponse);
    } catch (error) {
      console.error("Error updating setting", error);
    }
  };

  const handleStatus = async (userId) => {
    try {
      await axios.post(`${BASE_URL}/updateActiveStatus/${userId}`);
      window.location.reload();
    } catch (error) {
      console.error("Error updating Status", error);
    }
  };
  //Filter Mentors
  const filteredUsers = users.filter((user) => {
    const userName = user.name ? user.name.toLowerCase() : "";
    const userRegnumber = user.regnumber ? user.regnumber.toLowerCase() : "";

    return (
      userName.includes(filterName.toLowerCase()) &&
      userRegnumber.includes(filterRegnumber.toLowerCase())
    );
  });

  //Pagination for Mentor
  // Calculate the indices for the current page
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

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
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleUsersPerPageChange = (e) => {
    setUsersPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  //Download Mentor and Alumni list as PDF
  const handleDownloadTable = () => {
    const columns = [
      { label: "Name", key: "name" },
      { label: "Reg Number", key: "regnumber" },
      { label: "Phone", key: "phone" },
      { label: "Email", key: "email" }
    ];

    downloadPDF(users, columns, "mentors_list", {
      title: "Mentors",
      titleFontSize: 14,
      startY: 15
    });
  };

  return (
    <DashboardLayout>
      {isLoading && <Spinner />}
      <div className="m-2 md:m-5 mt-12 p-2 md:p-0 bg-white rounded-3xl flex flex-row justify-between items-center">
        <Header category="Academics" title="Mentors" />
        <div>
          {user?.isAdmin === true && (
            <div>
              <Button
                color="white"
                bgColor={currentColor}
                text="Add Mentor"
                borderRadius="8px"
                width="5px"
                height="10px"
                custumFunc={onClick}
              />

              <label className="ml-2 inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAcceptingResponse}
                  className="sr-only peer"
                  onChange={handleToggle}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  {isAcceptingResponse
                    ? "Accepting Responses"
                    : "Not Accepting Responses"}
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="m-2 md:m-0 mt-0 p-2 md:p-7 bg-white rounded-3xl">
        <h2 className="text-center text-xl font-bold tracking-tight text-slate-900">
          Mentor List
        </h2>
        <div className="container mt-5">
          <div className="flex flex-col space-y-0 mb-3 md:flex-row md:space-x-3 md:space-y-0">
            <div className="flex-1 flex flex-col p-2">
              <form className="flex items-center">
                <label htmlFor="simple-search" className="sr-only">
                  Filter by Name:
                </label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MdManageSearch />
                  </div>
                  <input
                    type="text"
                    className="form-control bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full pl-10 p-2"
                    placeholder="Search Mentor by Name"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                  />
                </div>
              </form>
            </div>
            <div className="flex-1 flex flex-col p-2">
              <form className="flex items-center">
                <label htmlFor="simple-search" className="sr-only">
                  Filter by Regnumber:
                </label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MdManageSearch />
                  </div>
                  <input
                    type="text"
                    id="simple-search"
                    className="form-control bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full pl-10 p-2"
                    placeholder="Enter Registration Number"
                    value={filterRegnumber}
                    onChange={(e) => setFilterRegnumber(e.target.value)}
                  />
                </div>
              </form>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 ">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-x border-t">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Reg Number</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Profile</th>
                </tr>
              </thead>
              <tbody className="border-b">
                {currentUsers
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((user) => (
                    <tr key={user._id} className="border-x">
                      <td className="border px-4 py-2">{user.name}</td>
                      <td className="border px-4 py-2">{user.regnumber}</td>
                      <td className="border px-4 py-2">{user.phone}</td>
                      <td className="border px-4 py-2">{user.email}</td>
                      <td className="border px-4 py-2">
                        <Link to={`/mentorProfile?mentor._id=${user._id}`}>
                          <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-normal hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                            Profile
                          </button>
                        </Link>
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
            totalUsers={filteredUsers.length}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
            onClick={handleDownloadTable}
          >
            Download Table as PDF
          </button>
        </div>
      </div>

      {user?.isAdmin === true && (
        <div>
          <h2 className="text-center text-xl font-bold tracking-tight text-slate-900">
            Inactive Users
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 ">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-x border-t">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Reg Number</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Profile</th>
                  <tr className="px-4 py-2">Status</tr>
                </tr>
              </thead>
              <tbody className="border-b">
                {inActiveUsers.map((user) => (
                  <tr key={user._id} className="border-x">
                    <td className="border px-4 py-2">{user.name}</td>
                    <td className="border px-4 py-2">{user.regnumber}</td>
                    <td className="border px-4 py-2">{user.phone}</td>
                    <td className="border px-4 py-2">{user.email}</td>
                    <td className="border px-4 py-2">
                      <Link to={`/mentorProfile?mentor._id=${user._id}`}>
                        <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-normal hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                          Profile
                        </button>
                      </Link>
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        className="bg-transparent hover:bg-blue-500 text-blue-700 font-normal hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                        onClick={() => handleStatus(user._id)}
                      >
                        Activate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Mentor;
