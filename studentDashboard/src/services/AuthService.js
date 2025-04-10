import axios from "axios";

const API_URL = "http://127.0.0.1:5001"; // Flask Backend URL

export const register = async (username, password, student_id) => {
  return axios.post(`${API_URL}/register`, { username, password, student_id });
};

export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/login`, { username, password });
  if (response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};
