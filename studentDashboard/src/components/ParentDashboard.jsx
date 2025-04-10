import React, { useEffect, useState } from "react";
import axios from "axios";

const ParentDashboard = ({ studentId }) => {
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    axios.get(`http://127.0.0.1:5001/parent_dashboard/${studentId}`)
      .then((res) => setStudentData(res.data))
      .catch((err) => console.error(err));
  }, [studentId]);

  return (
    <div className="p-6">
      <h1 className="text-4xl flex items-center">Parent Dashboard</h1>
      {studentData && (
        <div className="mt-4">
          <h3 className="font-bold">Student: {studentData.student_name}</h3>
          <ul>
            {studentData.performance.map((subject, index) => (
              <li className="ml-3" key={index}>{subject.subject}: {subject.score} ({subject.risk})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
