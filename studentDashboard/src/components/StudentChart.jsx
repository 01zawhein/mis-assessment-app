import React, { useEffect, useState } from "react";
import axios from "axios";

const StudentChart = ({ studentId }) => {
  const [chart, setChart] = useState("");

  useEffect(() => {
    axios.get(`http://127.0.0.1:5001/performance_chart/${studentId}`)
      .then((res) => setChart(res.data.chart))
      .catch((err) => console.error(err));
  }, [studentId]);

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-3xl flex items-center">Performance Overview</h1>
      {chart && <img src={chart} className="mt-4 rounded-2xl shadow-2xl" alt="Performance Chart" />}
    </div>
  );
};

export default StudentChart;
