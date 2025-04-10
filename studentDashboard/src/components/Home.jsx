import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { getToken } from "../services/AuthService";
import StudentDashboard from "./StudentDashboard";

const Home = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div>
            <nav className="bg-blue-600">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <h1 className="text-white font-bold text-xl">Shireland</h1>
                        </div>
                        {/* Desktop Menu */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <a href="/" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">Overview</a>
                                <a href="/about" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">Trends</a>
                                <a href="/services" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">Leaderboard</a>
                                <a href="/contact" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium">AI Chatbot</a>
                            </div>
                        </div>
                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={toggleMenu} className="text-white hover:text-gray-300 focus:outline-none">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden">
                        <a href={<StudentDashboard />} className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium">Overview</a>
                        <a href="/about" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium">Trends</a>
                        <a href="/services" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium">Leaderboard</a>
                        <a href="/contact" className="block text-white hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium">AI Chatbot</a>
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Home;