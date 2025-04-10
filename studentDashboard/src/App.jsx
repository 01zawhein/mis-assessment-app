import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import StudentDashboard from "./components/StudentDashboard";
import Leaderboard from "./components/Leaderboard";
import Chatbot from "./components/Chatbot";
import Profile from "./components/Profile";
import Navbar from "./components/Navbar";
import { getToken } from "./services/AuthService";

const PrivateRoute = ({ children }) => {
  return getToken() ? children : <Navigate to="/login" />;
};

// Component to conditionally show Navbar
const Layout = ({ children }) => {
  const location = useLocation(); // Get current route

  // Hide Navbar on login and register pages
  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Private Routes */}
          <Route path="/dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="/chatbot" element={<PrivateRoute><Chatbot /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
