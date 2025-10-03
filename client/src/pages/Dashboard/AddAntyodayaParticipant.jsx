import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { classes, locations, modes } from "../../constants/Dashboard";
import { BASE_URL } from "../../../src/Service/helper";
import "react-datepicker/dist/react-datepicker.css";
import { showLoading, hideLoading } from "../../redux/features/alertSlice";
import { useDispatch } from "react-redux";

const AddAntyodayaParticipant = () => {
  const dispatch = useDispatch();
  const [credentials, setCredentials] = useState({
    name: "",
    class: "",
    phone: "",
    school: "",
    // aadhar: "",
    address: "",
    photo: "",
    poc: "",
    events: [],
  });
  const [pocList, setPocList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [imageSize, setImageSize] = useState("");
  const WIDTH = 800;

  useEffect(() => {
    // Fetch POC and Event data on component mount
    const fetchPocAndEventData = async () => {
      try {
        const pocResponse = await axios.get(`${BASE_URL}/pocList`);
        const eventResponse = await axios.get(`${BASE_URL}/getEvents`);
        const currentYear = new Date().getFullYear();

        // Filter POCs by current year
        const currentYearPocs = pocResponse.data.filter(poc => poc.year === currentYear);
        const currentYearEvents = eventResponse.data.filter(event => event.year === currentYear);
        setPocList(currentYearPocs);
        setEventList(currentYearEvents);

        console.log("POCs (current year only):", currentYearPocs);
        console.log("Events (current year only):", currentYearEvents);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        dispatch(hideLoading());
      }
    };

    fetchPocAndEventData();
  }, [dispatch]);

  // Resizing and setting photo
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const imageUrl = event.target.result;
        const image = new Image();
        image.src = imageUrl;

        image.onload = () => {
          const canvas = document.createElement("canvas");
          const ratio = WIDTH / image.width;
          canvas.width = WIDTH;
          canvas.height = image.height * ratio;

          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          // Convert the canvas to a file
          canvas.toBlob(
            (blob) => {
              const resizedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            },
            "image/jpeg",
            0.98
          );
        };
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(showLoading());
    const formData = new FormData();
    formData.append("name", credentials.name);
    formData.append("class", credentials.class);
    formData.append("phone", credentials.phone);
    formData.append("school", credentials.school);
    formData.append("address", credentials.address);
    formData.append("photo", credentials.photo);
    formData.append("poc", credentials.poc);
    formData.append("events", credentials.events.join(","));

    try {
      const res = await axios.post(`${BASE_URL}/addParticipants`, formData);
      if (res.data === "Participant Added") {
        alert("Participant submitted successfully!");
        setCredentials({
          name: "",
          class: "",
          phone: "",
          school: "",
          address: "",
          photo: "",
          poc: "",
          events: [],
        });
      } else {
        alert(res.data);
      }
    } catch (err) {
      alert("ALL INPUT IS NOT FILLED");
      console.error("error", err);
    } finally {
      dispatch(hideLoading());
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const onPhotoChange = async (e) => {
    const imageFile = e.target.files[0];
    if (imageFile) {
      // Resize the image and update the credentials state
      const resizedImage = await resizeImage(imageFile);
      const sizeInKB = (resizedImage.size / 1024).toFixed(2); // Calculate size in KB
      setImageSize(`${sizeInKB} KB`);
      setCredentials({ ...credentials, photo: resizedImage });
    }
  };

  const onPocChange = (e) => {
    const selectedPocId = e.target.value;
    const selectedPoc = pocList.find((poc) => poc._id === selectedPocId);

    // Set the selected POC and automatically update the school based on the selected POC
    setCredentials({
      ...credentials,
      poc: selectedPocId,
      school: selectedPoc ? selectedPoc.school : "", // If POC is found, set the school, otherwise leave it blank
    });
  };
  const handleEventChange = (selectedEvent, group) => {
    setCredentials((prevCredentials) => {
      const selectedEventId = selectedEvent._id;
      const isAlreadySelected = prevCredentials.events.includes(selectedEventId);
  
      // Check if the event is already selected, remove it if so
      if (isAlreadySelected) {
        return {
          ...prevCredentials,
          events: prevCredentials.events.filter((eventId) => eventId !== selectedEventId),
        };
      }
  
      // Check if the max number of events (3) is reached
      if (prevCredentials.events.length >= 3) {
        alert("You can only select up to 3 events.");
        return prevCredentials;
      }
  
      // Ensure only one event per group is selected
      const filteredEvents = prevCredentials.events.filter((eventId) => {
        const event = eventList.find((e) => e._id === eventId);
        return event.eventGroup !== group;
      });
  
      // Add the newly selected event
      return {
        ...prevCredentials,
        events: [...filteredEvents, selectedEventId],
      };
    });
  };
  
  return (
    <DashboardLayout>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="space-y-8">
            <div className="border-b border-gray-900/10 pb-8">
              <h2 className="text-base font-bold leading-7 text-gray-900">
                Add Participants Details
              </h2>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-2 sm:col-start-1">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Name
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                      <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm"></span>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        value={credentials.name}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Phone
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={credentials.phone}
                      onChange={onChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 sm:col-start-1">
                  <label
                    htmlFor="class"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Class
                  </label>
                  <div className="mt-2">
                    <select
                      name="class"
                      id="class"
                      value={credentials.class}
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

                <div className="sm:col-span-4">
                  <label
                    htmlFor="poc"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Point of Contact
                  </label>
                  <select
                    name="poc"
                    id="poc"
                    value={credentials.poc}
                    onChange={onPocChange} // Updated onChange handler
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  >
                    <option value="">Select POC</option>
                    {pocList
                      .sort((a, b) => a.nameOfPoc.localeCompare(b.nameOfPoc))
                      .map((poc) => (
                        <option key={poc._id} value={poc._id}>
                          {poc.nameOfPoc} - {poc.school}
                        </option>
                      ))}
                  </select>
                </div>
                {/* <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6"> */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="school"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    School
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="school"
                      id="school"
                      value={credentials.school}
                      onChange={onChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

              

                <div className="col-span-full">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Complete Address
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="address"
                      name="address"
                      value={credentials.address}
                      onChange={onChange}
                      rows={3}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Mention all possible details.
                  </p>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="photo"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Photo
                  </label>
                  <input
                    type="file"
                    name="photo"
                    accept=".png, .jpg, .jpeg,capture=camera"
                    // Specify 'camera' to use the device's camera
                    onChange={onPhotoChange}
                  />
                  {imageSize && (
                    <p className="text-sm mt-2 ">
                      Uploaded image size:{" "}
                      <span
                        className={
                          parseFloat(imageSize) > 1024
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {imageSize}
                      </span>
                    </p>
                  )}
                  {parseFloat(imageSize) > 1024 && (
                    <p className="text-sm text-red-600 mt-1">
                      Please upload a compressed image.
                    </p>
                  )}
                </div>

                

                <div className="sm:col-span-4">
                  <label
                    htmlFor="events"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Select up to 3 events, but only one event per group.
                  </label>

                  <div className="mt-2 flex flex-col gap-2">
                    {Object.entries(
                      eventList.reduce((acc, event) => {
                        // Group events by eventGroup
                        if (!acc[event.eventGroup]) {
                          acc[event.eventGroup] = [];
                        }
                        acc[event.eventGroup].push(event);
                        return acc;
                      }, {})
                    ).map(([group, events]) => (
                      <div key={group} className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Event-{group}</h3>
                        <div className="flex flex-col gap-2 mt-2">
                          {events
                            .sort((a, b) => a.eventName.localeCompare(b.eventName))
                            .map((event) => {
                              return (
                                <div key={event._id} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    value={event._id}
                                    onChange={() => handleEventChange(event, group)}
                                    checked={credentials.events.includes(event._id)}
                                    className="mr-2"
                                  />
                                  <label className="text-sm text-gray-900">{event.eventName}</label>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Existing fields continue here... */}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="button"
              className="text-sm font-semibold leading-6 text-gray-900"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddAntyodayaParticipant;
