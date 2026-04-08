import React from "react";
import UserProfile from "./UserProfile";

const CitizenPanel = () => {
  return (
    <section className="px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        <UserProfile />
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mt-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4">Welcome to Samvidhan Path</h2>
          <p className="text-gray-600 dark:text-gray-300">
            As a standard Citizen, this is your profile dashboard. You can upload an avatar safely to our servers here. Explore the Constitution, play games, read lessons, and submit queries to Admins using the Contact Us form!
          </p>
        </div>
      </div>
    </section>
  );
};

export default CitizenPanel;
