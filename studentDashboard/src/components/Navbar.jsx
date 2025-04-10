import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken, logout } from "../services/AuthService";
import axios from "axios";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.log("No token found, hiding user icon.");
      return;
    }

    axios.get("http://127.0.0.1:5001/get_user", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      console.log("User fetched:", res.data);
      setUser(res.data);
    })
    .catch(err => console.error("Error fetching user:", err.response ? err.response.data : err));
  }, []);

  // Close the dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  

  return (
    <nav className="bg-blue-600 p-4 flex justify-between items-center">
      {/* Website Title */}
      <h1 className="text-white font-bold text-xl">Shireland</h1>

      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-4">
        <Link to="/dashboard" className="text-white hover:underline">Dashboard</Link>
        <Link to="/leaderboard" className="text-white hover:underline">Leaderboard</Link>
        <Link to="/chatbot" className="text-white hover:underline">Virtual Tutor</Link>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none cursor-pointer p-1 rounded-full border-2">
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />} {/* Toggle between Menu (☰) and Close (X) */}
        </button>
      </div>

      {/* Mobile Navigation - Collapsible */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-blue-700 shadow-lg md:hidden flex flex-col text-white text-center py-4">
          <Link to="/dashboard" className="py-2 hover:bg-blue-800" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
          <Link to="/leaderboard" className="py-2 hover:bg-blue-800" onClick={() => setIsMenuOpen(false)}>Leaderboard</Link>
          <Link to="/chatbot" className="py-2 hover:bg-blue-800" onClick={() => setIsMenuOpen(false)}>Virtual Tutor</Link>
        </div>
      )}

      {/* User Profile Dropdown */}
      {user && (
        <div className="relative ml-4" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            className="focus:outline-none"
          >
            <img 
              src={user.profile_pic || "/default-avatar.png"} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border border-gray-300 cursor-pointer"
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 bg-white shadow-md rounded-md py-2 w-40">
              <Link 
                to="/profile" 
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Profile
              </Link>
              <button 
                onClick={handleLogout} 
                className="block px-4 py-2 text-red-500 hover:bg-gray-100 w-full text-left cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
