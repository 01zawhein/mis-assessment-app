import React, { useState } from "react";
import { register } from "../services/AuthService";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await register(username, password, studentId);
      navigate("/login"); // Redirect to Login after registration
    } catch (err) {
      setError("Registration failed. Try again.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Sign Up for MIS Assessment Web App</h1>
      <form onSubmit={handleRegister} className="bg-white p-6 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Username"
          className="border p-2 w-full mb-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="number"
          placeholder="Student ID"
          className="border p-2 w-full mb-2"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full rounded cursor-pointer">
          Register
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default RegisterPage;
