import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PerformanceLineChart = ({ data , avgData}) => {
    // console.log(data)
    // console.log(avgData)
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">No performance data available</p>;
  }

  let labels, val;
  if (data[0]?.month) {
    labels = data.map((test) => test.month);
    val = 1e9;
  } else {
    labels = data.map((test) => {
      const date = new Date(test.date);
      return `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`;
    });
    val = 5;
  }

  const interval = Math.max(1, Math.floor(labels.length / val));

  const chartData = {
    labels: labels.map((label, index) => (index % interval === 0 ? label : "")),
    datasets: [
      {
        label: "Test Score",
        data: data.map((test) => test.score),
        borderColor: "#87CEEB",
        backgroundColor: "rgba(135, 206, 235, 0.2)",
        pointBackgroundColor: "#0077b6",
        pointBorderColor: "#0077b6",
        fill: true,
        tension: 0.4,
        pointHoverRadius: 6,
      },
      {
        label: "Average Score",
        data: avgData?.map((test) => test.score),
        borderColor: "#FFA500",
        backgroundColor: "rgba(255, 165, 0, 0.2)",
        pointBackgroundColor: "#FF8C00",
        pointBorderColor: "#FF8C00",
        fill: false,
        borderDash: [5, 5], 
        tension: 0.4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const date = new Date(data[index].date);
            return val === 1e9 ? tooltipItems.label : `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#333" },
      },
      y: { min: 0, max: 100, ticks: { stepSize: 10, color: "#333" } },
    },
  };

  return (
    <div className="bg-white p-4 shadow-md rounded-lg w-full h-96">
      <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
        Student Performance Over Time
      </h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default PerformanceLineChart;
