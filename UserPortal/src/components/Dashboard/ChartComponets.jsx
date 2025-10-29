import React, { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import { BASEURL } from "../constant/constant";

const ChartComponents = ({ listCampType }) => {
  const userId = sessionStorage.getItem("userId");
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Camp Request Count",
        backgroundColor: "#9fdef0",
        borderColor: "#9fdef0",
        borderWidth: 2,
        data: [],
      },
      {
        label: "Camp Report Count",
        backgroundColor: "#f6aa54",
        borderColor: "#f6aa54",
        borderWidth: 2,
        data: [],
      },
    ],
  });

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    responsive: true, // Make the chart responsive
    maintainAspectRatio: false, // Don't maintain aspect ratio for responsiveness
  };
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const convertMonthNumberToName = (monthNumber) => {
    return monthNames[monthNumber - 1];
  };

  const getCampCountForGraph = async () => {
    try {
      const response = await axios.post(`${BASEURL}/dashboard/getCampCount`, {
        userId: userId,
        campTypeId: listCampType,
      });
      const response1 = await axios.post(
        `${BASEURL}/campRequest/getCampRequestCount`,
        {
          userId: userId,
          campTypeId: listCampType,
        }
      );

      // Assuming response.data contains the same structure as your stacked bar chart data
      const sortedData = response.data.sort((a, b) => {
        // If years are different, sort by year
        if (a.report_year !== b.report_year) {
          return a.report_year - b.report_year;
        }
        // If years are the same, sort by month
        return a.report_month - b.report_month;
      });

      const sortedData1 = response1.data.sort((a, b) => {
        // If years are different, sort by year
        if (a.report_year !== b.report_year) {
          return a.report_year - b.report_year;
        }
        // If years are the same, sort by month
        return a.report_month - b.report_month;
      });

      const xValues = sortedData1.map(
        (item) =>
          `${convertMonthNumberToName(item.report_month)} ${item.report_year}`
      );

      //console.log("X values", xValues);
      const camp_request_count = sortedData1.map(
        (item) => item.Camp_Request_Count
      );
      const camp_count = sortedData.map((item) => item.Camp_Count);

      //const pendingValues = sortedData.map(item => item.survey_pending);
      setChartData({
        labels: xValues,
        datasets: [
          { ...chartData.datasets[0], data: camp_request_count },
          { ...chartData.datasets[1], data: camp_count },
        ],
      });
    } catch (error) {
      console.error("Error fetching survey data:", error);
    }
  };

  useEffect(() => {
    getCampCountForGraph();
  }, [listCampType]);
  return (
    <div className="bar">
      <Bar data={chartData} options={options}></Bar>
    </div>
  );
};

export default ChartComponents;
