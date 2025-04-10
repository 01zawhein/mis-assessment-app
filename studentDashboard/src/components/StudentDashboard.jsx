import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { getToken } from "../services/AuthService";

const StudentDashboard = () => {
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [student, setStudent] = useState(null);
  const [badge, setBadge] = useState("");
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.error("No token found, redirecting to login.");
      setLoading(false);
      return;
    }

    axios
      .get("http://127.0.0.1:5001/student/performance", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStudentPerformance(res.data.performance))
      .catch((err) => console.error("Error fetching performance:", err));


      axios.get("http://127.0.0.1:5001/get_user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        console.log("User data received:", res.data);
        setStudent(res.data);
        return axios.get("http://127.0.0.1:5001/badges", { headers: { Authorization: `Bearer ${token}`}},);
      })
      .then(res => {
        console.log("Badge received:", res.data);
        setBadge(res.data.badge);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching student data:", err.response ? err.response.data : err);
        setLoading(false);
      });
    }, []);



  if (!studentPerformance.length) return <p>Loading student data...</p>;

  // Extract subjects, scores, and risk levels
  const subjects = studentPerformance.map(({ subject }) => subject);
  const scores = studentPerformance.map(({ avg_score }) => avg_score);
  const riskLevels = studentPerformance.map(({ risk_level }) => risk_level);

  // Identify best and worst subjects
  const bestSubject = studentPerformance.reduce((best, curr) => (curr.avg_score > best.avg_score ? curr : best));
  const worstSubject = studentPerformance.reduce((worst, curr) => (curr.avg_score < worst.avg_score ? curr : worst));

  // Learning Platform Recommendations
  const recommendations = {
    Math: "Khan Academy, Brilliant, or Coursera",
    English: "Grammarly, Duolingo, or BBC Bitesize",
    Science: "Khan Academy, National Geographic, or TED-Ed",
    History: "BBC History, CrashCourse, or History Extra",
    Coding: "Codecademy, FreeCodeCamp, or LeetCode",
  };

  const recommendedPlatform = recommendations[worstSubject.subject] || "YouTube & Online Learning Platforms";

  // Chart Data
  const chartData = {
    labels: subjects,
    datasets: [
      {
        label: "Average Score",
        data: scores,
        backgroundColor: scores.map((score) =>
          score < 40 ? "red" : score < 60 ? "orange" : "green"
        ),
      },
    ],
  };

  return (

    <div className="p-6 bg-gray-100 min-h-screen">
      
      <h1 className="text-4xl">
        Welcome Back, { student ? student.name : "Loading..." }!
        { badge && <span className="ml-2 text-yellow-500">{badge}</span> }
      </h1>
      <br />
      <h2 className="text-3xl font-bold mb-4">Student Performance Overview</h2>

      {/* Performance Summary Table */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Performance Summary</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Subject</th>
              <th className="border p-2">Average Score</th>
              <th className="border p-2">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {studentPerformance.map(({ subject, avg_score, risk_level }, index) => (
              <tr
                key={index}
                className={risk_level === "High" ? "bg-red-200" : risk_level === "Medium" ? "bg-yellow-200" : "bg-green-200"}
              >
                <td className="border p-2">{subject}</td>
                <td className="border p-2">{avg_score}</td>
                <td className="border p-2 font-bold">{risk_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Performance Trends</h2>
        <Bar data={chartData} />
      </div>

      {/* Performance Analysis & Recommendations */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Performance Analysis</h2>
        <p>✅ **You're doing great in:** <b>{bestSubject.subject}</b> 🎉</p>
        <p>⚠️ **You need improvement in:** <b>{worstSubject.subject}</b> 😟</p>
        <p>📌 If you don’t improve in <b>{worstSubject.subject}</b>, it may affect your final grades.</p>
        <p>🎯 We recommend using: <b>{recommendedPlatform}</b> to improve.</p>
      </div>
    </div>
  );
};

export default StudentDashboard;
