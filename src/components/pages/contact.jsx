import React, { useState } from "react";
import { motion } from "framer-motion";
import nikhileshImg from "../../assets/nikhilesh.png";
import vikasImg from "../../assets/vikas.png";
import premImg from "../../assets/prem.png";
// Placeholder for the requested image in src directory
import satishImg from "../../assets/satish.png";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const [showPopup, setShowPopup] = useState(false); // To control the popup visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Failed to submit query");

      // Show the popup after submission
      setShowPopup(true);

      // Clear form data
      setFormData({ firstName: "", lastName: "", email: "", message: "" });

      // Hide popup after 3 seconds
      setTimeout(() => setShowPopup(false), 3000);
    } catch (error) {
      console.error("Error saving query:", error);
    }
  };

  return (
    <section className="min-h-screen px-4 py-16 bg-gradient-to-br from-yellow-50 via-gray-100 to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-yellow-600 dark:text-yellow-400 drop-shadow-lg">Contact Us</h1>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          Please fill the form and we will get back to you soon.
        </p>
      </div>

      {/* Contact Form */}
      <div className="flex justify-center mb-12">
        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col w-full max-w-lg p-8 border border-yellow-200 shadow-2xl bg-white/90 rounded-2xl dark:bg-gray-800/90 dark:text-gray-100 dark:border-yellow-700"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <label className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
          <div className="flex flex-col gap-4 mb-4 sm:flex-row">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              required
            />
          </div>

          <label className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="p-3 mb-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            required
          />

          <label className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Message</label>
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            className="p-3 mb-6 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            rows="4"
            required
          />

          <button
            type="submit"
            className="p-3 text-lg font-semibold text-white transition bg-yellow-500 rounded-md shadow hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
          >
            Submit
          </button>
        </motion.form>
      </div>

      {/* Team Details */}
      <motion.div
        className="w-full max-w-4xl p-6 mx-auto mb-8 border border-yellow-200 shadow-2xl sm:p-8 bg-white/90 rounded-2xl dark:bg-gray-800/90 dark:border-yellow-700"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="flex items-center justify-center gap-2 mb-8 text-2xl font-bold text-center text-yellow-600 dark:text-yellow-400">
          <span role="img" aria-label="team"></span> Team
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* S S Nikhilesh */}
          <div className="flex flex-col items-center">
            <img src={nikhileshImg} alt="S S Nikhilesh" className="w-24 h-24 object-cover border-2 border-yellow-400 rounded-full shadow-lg" />
            <span className="mt-3 text-lg font-semibold text-center text-gray-800 dark:text-gray-100">S S Nikhilesh</span>
            <a href="https://www.linkedin.com/in/surapaneni-sathya-nikhilesh/" target="_blank" rel="noopener noreferrer" className="mt-2 transition-transform hover:scale-110">
              <img src="https://img.icons8.com/fluency/32/000000/linkedin.png" alt="LinkedIn" />
            </a>
          </div>

          {/* S Vikas Srinivas */}
          <div className="flex flex-col items-center">
            {/* Placeholder using UI-Avatars. To use a real image, save it to src/assets/team/vikas.jpg and import it at the top, then replace src below */}
            <img src={vikasImg} alt="S Vikas Srinivas" className="w-24 h-24 border-2 border-yellow-400 rounded-full shadow-lg" />
            <span className="mt-3 text-lg font-semibold text-center text-gray-800 dark:text-gray-100">S Vikas Srinivas</span>
            <a href="https://www.linkedin.com/in/vikas-srinivas-9543a0386/" target="_blank" rel="noopener noreferrer" className="mt-2 transition-transform hover:scale-110">
              <img src="https://img.icons8.com/fluency/32/000000/linkedin.png" alt="LinkedIn" />
            </a>
          </div>

          {/* J Prem Karthikeya */}
          <div className="flex flex-col items-center">
            {/* Placeholder using UI-Avatars. To use a real image, save it to src/assets/team/prem.jpg and import it at the top, then replace src below */}
            <img src={premImg} alt="J Prem Karthikeya" className="w-24 h-24 border-2 border-yellow-400 rounded-full shadow-lg" />
            <span className="mt-3 text-lg font-semibold text-center text-gray-800 dark:text-gray-100">J Prem Karthikeya</span>
            <a href="https://in.linkedin.com/in/prem-karthikeya" target="_blank" rel="noopener noreferrer" className="mt-2 transition-transform hover:scale-110">
              <img src="https://img.icons8.com/fluency/32/000000/linkedin.png" alt="LinkedIn" />
            </a>
          </div>
        </div>
      </motion.div>

      {/* Mentor Details */}
      <motion.div
        className="w-full max-w-4xl p-6 mx-auto mb-8 border border-yellow-200 shadow-2xl sm:p-8 bg-white/90 rounded-2xl dark:bg-gray-800/90 dark:border-yellow-700"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="flex items-center justify-center gap-2 mb-8 text-2xl font-bold text-center text-yellow-600 dark:text-yellow-400">
          <span role="img" aria-label="mentor"></span> Our Mentor
        </h2>
        <div className="flex flex-col items-center justify-center">
          <img src={satishImg} alt="Dr Satish Thatavarthi" className="w-32 h-32 object-cover border-2 border-yellow-400 rounded-full shadow-lg" />
          <span className="mt-4 text-xl font-bold text-center text-gray-800 dark:text-gray-100">Dr Satish Thatavarthi</span>
          <a href="https://www.linkedin.com/in/satishthatavarthi/" target="_blank" rel="noopener noreferrer" className="mt-2 transition-transform hover:scale-110">
            <img src="https://img.icons8.com/fluency/32/000000/linkedin.png" alt="LinkedIn" />
          </a>
        </div>
      </motion.div>

      {/* Popup Message */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="p-6 text-center bg-white rounded-lg shadow-lg dark:bg-gray-700 dark:text-gray-100">
            <h2 className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">Thank you!</h2>
            <p>Your query is recorded. We will answer it soon.</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default ContactUs;
