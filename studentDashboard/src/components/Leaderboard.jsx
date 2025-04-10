import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../services/AuthService";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.error("No token found, redirecting to login.");
      setLoading(false);
      return;
    }
    axios.get("http://127.0.0.1:5001/leaderboard", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setLeaderboard(res.data.leaderboard))
      .catch((err) => console.error(err));
  }, []);


  return (
    <div className="p-4 bg-gray-100">
      <h1 className="text-3xl mb-4">Student Progress Leaderboard</h1>
      <div className="max-w-md bg-white p-4 rounded-lg shadow-md">
        <ol className="list-decimal pl-5">
          {leaderboard.map((student, index) => (
            <li key={index} className="text-gray-700">
              {student.name}: {student.avg_score.toFixed(2)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default Leaderboard;
