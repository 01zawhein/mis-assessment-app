// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { getToken } from "../services/AuthService";

// const Profile = () => {
//   const [name, setName] = useState("");
//   const [profilePic, setProfilePic] = useState("");
  
//   useEffect(() => {
//     axios.get("http://127.0.0.1:5001/get_user", {
//       headers: { Authorization: `Bearer ${getToken()}` },
//     })
//     .then(res => {
//       setName(res.data.name);
//       setProfilePic(res.data.profile_pic);
//     });
//   }, []);

//   const handleSave = () => {
//     axios.post("http://127.0.0.1:5001/update_profile", { name, profile_pic: profilePic });
//   };

//   return (
//     <div className="p-6">
//       <h1>Edit Profile</h1>
//       <input type="text" value={name} onChange={e => setName(e.target.value)} />
//       <button onClick={handleSave}>Save</button>
//     </div>
//   );
// };

// export default Profile;


import React, { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../services/AuthService";

const Profile = () => {
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    axios.get("http://127.0.0.1:5001/get_user", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    .then(res => {
      setName(res.data.name);
      setProfilePic(res.data.profile_pic ? `http://127.0.0.1:5001/uploads/${res.data.profile_pic}` : "/default-avatar.png");
    })
    .catch(err => console.error("Error fetching user:", err));
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload profile picture
  const handleUpload = async () => {
    if (!file) return alert("Please select an image first!");

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://127.0.0.1:5001/upload_profile_pic", formData, {
        headers: { 
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data"
        },
      });

      setProfilePic(`http://127.0.0.1:5001/uploads/${res.data.profile_pic}`);
      alert("Profile picture updated successfully!");
    } catch (err) {
      console.error("Error uploading profile picture:", err);
    } finally {
      setUploading(false);
    }
  };

  // Save name update
  const handleSave = () => {
    axios.post("http://127.0.0.1:5001/update_profile", { name }, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    .then(() => alert("Profile updated successfully!"))
    .catch(err => console.error("Error updating profile:", err));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>

        {/* Profile Picture */}
        <div className="relative">
          <img 
            src={profilePic} 
            alt="Profile" 
            className="w-32 h-32 rounded-full border border-gray-300 mx-auto"
          />
          <input 
            type="file" 
            accept="image/*" 
            className="mt-3 w-full p-2 border rounded-lg cursor-pointer"
            onChange={handleFileChange}
          />
          <button 
            onClick={handleUpload} 
            disabled={uploading}
            className="bg-blue-500 text-white mt-2 px-4 py-2 rounded-lg w-full hover:bg-blue-600 disabled:bg-gray-400"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* Name Update */}
        <div className="mt-4">
          <label className="block text-gray-700 font-semibold">Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <button 
          onClick={handleSave} 
          className="bg-green-500 text-white mt-4 px-4 py-2 rounded-lg w-full hover:bg-green-600"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Profile;
