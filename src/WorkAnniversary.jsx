import axios from "axios";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

const WorkAnniversary = () => {
  const [anniversaryData, setAnniversaryData] = useState([]);
  const [flag, setFlag] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [empInfo, setEmpInfo] = useState("");
  const [employee, setEmployee] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [wishedStatus, setWishedStatus] = useState([]);

  const dateTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const fetchWishedStatus = async () => {
      try {
        localStorage.setItem("wishedStatus", JSON.stringify([]));

        const response = await axios.get(
          "http://localhost:8080/api/work-anniversary/getWishedStatus"
        );
        setWishedStatus(response.data);

        console.log("Fetched status at the target time");
      } catch (error) {
        console.error("Error fetching work anniversary data:", error);
      }
    };

    const interval = setInterval(() => {
      const currentTime = dateTime();
      console.log(`Current Time: ${currentTime}`);
      if (currentTime === "13:58:00") {
        fetchWishedStatus();
        setAnniversaryData((prevData) =>
          prevData.map((item) => ({
            ...item,
            wished: false,
          }))
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [wishedStatus]);

  useEffect(() => {
    const fetchAnniversaryData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/work-anniversary/getall"
        );
        const formattedData = response.data.map((item) => ({
          ...item,
          dateOfJoining: format(new Date(item.dateOfJoining), "dd-MM-yyyy"),
          wished: wishedStatus.includes(item.id), // Check if the employee is in the wished list
        }));
        setAnniversaryData(formattedData);
      } catch (error) {
        console.error("Error fetching work anniversary data:", error);
      }
    };

    fetchAnniversaryData();
  }, [wishedStatus]);

  useEffect(() => {
    const savedWishedStatus =
      JSON.parse(localStorage.getItem("wishedStatus")) || [];
    setWishedStatus(savedWishedStatus);
  }, []);

  const celebratingToday = anniversaryData.filter((workAnniversary) => {
    const [anniversaryDay, anniversaryMonth] = workAnniversary.dateOfJoining
      .split("-")
      .map(Number);
    return currentDay === anniversaryDay && currentMonth === anniversaryMonth;
  });

  const toggleFlag = (employee) => {
    setFlag(!flag);
    setSelectedEmployeeId(employee);
    setEmployee(employee.empId);
  };

  const handleButtonClick1 = () => {
    const messageContent = document.getElementById("messageInput").value;

    if (!messageContent) {
      alert("Please enter a message before sending.");
    } else {
      axios
        .get(
          `http://localhost:8080/api/work-anniversary/send_wish?empId=${selectedEmployeeId.empId}&message=${messageContent}`
        )
        .then((response) => {
          const { result, empId } = response.data;
          setEmpInfo(empId);
          if (response.data) {
            console.log("Email sent successfully");

            setAnniversaryData((prevData) =>
              prevData.map((item) =>
                item.id === selectedEmployeeId.id
                  ? { ...item, wished: true }
                  : item
              )
            );

            const newWishedStatus = [...wishedStatus, selectedEmployeeId.id];
            setWishedStatus(newWishedStatus);
            localStorage.setItem(
              "wishedStatus",
              JSON.stringify(newWishedStatus)
            );

            setSuccessMessage(
              <div className="flex items-center justify-center">
                <IoMdCheckmarkCircleOutline className="text-green-600 mr-2" />
                Successfully sent email wishes to {selectedEmployeeId.empName}
              </div>
            );

            setTimeout(() => {
              setSuccessMessage("");
            }, 5000);
          } else {
            console.error("Failed to send email");
            alert("Failed to send email. Please try again later.");
          }
        })
        .catch((error) => {
          console.error("Error sending email:", error);
          alert("Failed to send email. Check console for details.");
        })
        .finally(() => {
          setSelectedEmployeeId(null);
        });
    }
  };

  const handleButtonClick2 = () => {
    setFlag(false);
    setSelectedEmployeeId(null);
  };

  return (
    <div className="">
      <div className="bg-gray-200 h-screen w-full">
        <div className="bg-white h-[230px] w-[500px] rounded-lg ml-8 mt-4 absolute overflow-y-auto">
          <div className="ml-3 mt-4">
            <h1 className="text-lg font-semibold">
              Celebrating Work Anniversary Today
            </h1>
            {successMessage && (
              <div className="mt-4 -mb-2 text-center text-green-600">
                {successMessage}
              </div>
            )}
            {celebratingToday.map((workAnniversary) => (
              <div key={workAnniversary.id} className="grid grid-cols-7 mt-3">
                <div className="w-92 flex mt-7 col-span-4">
                  <img
                    src={`data:image/png;base64,${workAnniversary.imgName}`}
                    style={{ width: "58px", height: "45px" }}
                    className="rounded-full -mt-2"
                    alt={`${workAnniversary.empName}'s Avatar`}
                  />
                  <div className="ml-4 mr-6 -mt-1 text-gray-500">
                    <h2 className="text-[14px] font-bold mr-2 ">
                      {workAnniversary.empName}-{workAnniversary.empId}
                    </h2>
                    <p className="text-[14px]">
                      {workAnniversary.empDesignation}
                    </p>
                  </div>
                </div>
                <div className="col-span-2 mt-[27px] text-[13px] text-green-600 -ml-3">
                  {currentYear - workAnniversary.dateOfJoining.split("-")[2]}{" "}
                  Year Completed
                </div>
                <div className="col-span-1 mt-6 text-sm">
                  {flag &&
                  selectedEmployeeId &&
                  selectedEmployeeId.id === workAnniversary.id ? (
                    <div className="mt-10 bg-white pt-6 -ml-[345px] flex gap-1 text-xs">
                      <input
                        type="text"
                        placeholder="............"
                        className="w-60 border border-gray-300"
                        id="messageInput"
                      />
                      <button
                        onClick={handleButtonClick1}
                        className="border border-blue-500 h-6 px-4 text-blue-500 bg-white ml-18"
                      >
                        Send
                      </button>
                      <button
                        onClick={handleButtonClick2}
                        className="border border-gray-500 h-6 px-4 text-gray-500 bg-white ml-18"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => toggleFlag(workAnniversary)}
                        className="border border-blue-500 h-7 w-[72px] text-blue-500 bg-white text-sm -ml-8"
                        disabled={workAnniversary.wished}
                      >
                        {workAnniversary.wished ? "Wished" : "Wish"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkAnniversary;
