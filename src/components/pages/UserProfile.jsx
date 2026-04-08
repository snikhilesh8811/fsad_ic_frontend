import React, { useState } from "react";
import { authStorage } from "../../services/authService";

const UserProfile = () => {
  const session = authStorage.getSession();
  const user = session?.user;
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  if (!user) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setUploading(true);
      setMessage("");
      
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        const response = await fetch(`${API_BASE_URL}/api/auth/profile-picture`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, profilePicture: base64String })
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfilePicture(base64String);
          setMessage("Profile picture updated!");
          authStorage.updateUser(data.user); // if this method doesn't exist, we fallback
        } else {
          setMessage("Failed to upload image.");
        }
      } catch (err) {
        console.error(err);
        setMessage("Error uploading image.");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8 border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center gap-6">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400 shrink-0 bg-gray-100 flex justify-center items-center">
          {profilePicture ? (
            <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-gray-400">{user.name?.charAt(0)?.toUpperCase()}</span>
          )}
        </div>
        <label className="absolute inset-0 bg-black bg-opacity-50 text-white flex justify-center items-center text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
          Upload
          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
        </label>
      </div>

      <div className="text-center md:text-left flex-1">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center justify-center md:justify-start gap-2">
          {user.name} 
          {user.status === "APPROVED" && <span className="w-3 h-3 bg-green-500 rounded-full inline-block ml-2" title="Verified"></span>}
        </h2>
        <p className="text-gray-500 font-semibold">{user.email}</p>
        <p className="mt-2 text-sm">
          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
            {user.role}
          </span>
        </p>
        {message && <p className={`mt-2 text-sm font-semibold ${message.includes('Error') || message.includes('Failed') || message.includes('size') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
      </div>
    </div>
  );
};

export default UserProfile;
