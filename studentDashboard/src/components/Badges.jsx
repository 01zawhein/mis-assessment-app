import React, { useEffect, useState } from "react";
import axios from "axios";

const Badges = ({ studentId }) => {
  const [badgeData, setBadgeData] = useState(null);

  useEffect(() => {
    axios.get(`http://127.0.0.1:5001/badges/${studentId}`)
      .then((res) => setBadgeData(res.data))
      .catch((err) => console.error(err));
  }, [studentId]);

  return (
    <div className="p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Your Badge</h1>
      <div className="bg-white p-3 rounded-lg shadow-md">
        {badgeData ? (
          <p className="text-xl font-semibold">{badgeData.badge}</p>
        ) : (
          <p>Loading badge...</p>
        )}
      </div>
    </div>
  );
};

export default Badges;
