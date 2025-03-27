import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StudentPerformanceBarChart = ({ barChartData, subjects }) => {
  if (!barChartData || Object.keys(barChartData).length === 0) {
    return <p className="text-center text-gray-500">No data available</p>;
  }
  //check whether data is present or no
  const groupedData = useMemo(() => {
    const tempGroupedData = {};
    Object.entries(barChartData).forEach(([subject, data]) => {
      data.forEach(({ score, date }) => {
        const parsedDate = new Date(date);
        const monthKey = `${parsedDate.toLocaleString("default", { month: "short" })} ${parsedDate.getFullYear()}`;

        if (!tempGroupedData[monthKey]) tempGroupedData[monthKey] = {};
        if (!tempGroupedData[monthKey][subject]) tempGroupedData[monthKey][subject] = { total: 0, count: 0 };

        if(score > -1){
          tempGroupedData[monthKey][subject].total += score;
          tempGroupedData[monthKey][subject].count += 1;
        }
      });
    });
    return tempGroupedData;
  }, [barChartData]);

  if(Object.keys(groupedData).length === 0) return <p className="text-center text-gray-500">No Performance data available</p>;

  const labels = useMemo(() => {
    return Object.keys(groupedData)
      .map((monthKey) => {
        const [month, year] = monthKey.split(" ");
        return { monthKey, year: parseInt(year), monthIndex: new Date(`${month} 1, 2000`).getMonth() };
      })
      .sort((a, b) => a.year - b.year || a.monthIndex - b.monthIndex)
      .map((item) => item.monthKey);
  }, [groupedData]);


  const colors = [
    "rgba(255, 99, 132, 0.6)",   // Light Red
    "rgba(54, 162, 235, 0.6)",   // Light Blue
    "rgba(255, 206, 86, 0.6)",   // Light Yellow
    "rgba(75, 192, 192, 0.6)",   // Light Green
    "rgba(153, 102, 255, 0.6)",  // Light Purple
    "rgba(255, 159, 64, 0.6)",   // Light Orange
    "rgba(144, 238, 144, 0.6)",  // Light Lime Green
    "rgba(173, 216, 230, 0.6)",  // Light Sky Blue
    "rgba(240, 128, 128, 0.6)",  // Light Coral
    "rgba(221, 160, 221, 0.6)",  // Light Plum
    "rgba(175, 238, 238, 0.6)",  // Light Turquoise
    "rgba(250, 218, 221, 0.6)",  // Light Pink
    "rgba(245, 222, 179, 0.6)",  // Light Wheat
    "rgba(176, 224, 230, 0.6)",  // Light Powder Blue
    "rgba(152, 251, 152, 0.6)",  // Light Pale Green
  ];
  
  

  // Memoizing datasets to prevent unnecessary re-renders
  const datasets = useMemo(() => {
    return subjects
      .filter((subject) => labels.some((month) => groupedData[month]?.[subject.id])) // Only include subjects with data
      .map((subject, index) => ({
        label: subject.id,
        backgroundColor: colors[index % colors.length],
        borderColor: colors[index % colors.length].replace("0.6", "1"),
        borderWidth: 1,
        barThickness: 10,
        data: labels.map(
          (month) =>
            groupedData[month]?.[subject.id]?.total / groupedData[month]?.[subject.id]?.count || 0
        ),
      }));
  }, [subjects, labels, groupedData]);
  

  // console.log("datasets: ", datasets);

  const chartData = useMemo(
    () => ({
      labels,
      datasets,
    }),
    [labels, datasets]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#333" } },
        y: { min: 0, max: 100, ticks: { stepSize: 10, color: "#333" } },
      },
    }),
    []
  );

  // console.log("chartData: ", chartData);

  return (
    <Bar data={chartData} options={options} />
  );
  
};

export default StudentPerformanceBarChart;


