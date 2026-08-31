import React from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import { useSelector } from "react-redux";
import ClassAttendanceTable from "../../components/Dashboard/ClassAttendanceTable";

const Dashboard = () => {
  const { user } = useSelector((state) => state.user);

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="m-2 md:m-10 mt-24 p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-800">
            Welcome Back! {user ? user.name : "Mentor"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track daily class attendance and curriculum topics
          </p>
        </div>
      </div>

      {/* Class Overview Table */}
      <ClassAttendanceTable />
    </DashboardLayout>
  );
};

export default Dashboard;
