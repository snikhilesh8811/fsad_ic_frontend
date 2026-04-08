import React, { useState, useEffect } from "react";
import UserProfile from "./UserProfile";

const EducatorPanel = () => {
  const [lessons, setLessons] = useState([]);
  const [title, setTitle] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [content, setContent] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [publishedLessons, setPublishedLessons] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchLessons = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const [expertRes, pubRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/lessons/expert-approved`),
        fetch(`${API_BASE_URL}/api/lessons`)
      ]);
      
      if (expertRes.ok) {
        setLessons(await expertRes.json());
      }
      if (pubRes.ok) {
        setPublishedLessons(await pubRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch lessons", err);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const [editingLessonId, setEditingLessonId] = useState(null);

  const handleUpdateAndPublish = async (e) => {
    e.preventDefault();
    if (!editingLessonId) return;
    setStatusMessage("Publishing...");
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const payload = { title, moduleName, content };
      
      // Update Content
      const updateResponse = await fetch(`${API_BASE_URL}/api/lessons/${editingLessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!updateResponse.ok) {
        setStatusMessage("Failed to update lesson.");
        return;
      }
      
      // Publish
      const publishResponse = await fetch(`${API_BASE_URL}/api/lessons/${editingLessonId}/publish`, {
        method: "PATCH"
      });
      
      if (publishResponse.ok) {
        setStatusMessage("Lesson successfully published to Citizens!");
        setTitle("");
        setModuleName("");
        setContent("");
        setEditingLessonId(null);
        fetchLessons(); // refresh list
      } else {
        setStatusMessage("Lesson updated but failed to publish. (Did you drop the lessons table and restart backend?)");
      }
    } catch (err) {
      setStatusMessage("Error publishing lesson. (Did you drop the lessons table and restart backend?)");
      console.error(err);
    }
  };

  return (
    <section className="px-6 py-12">
      <div className="max-w-6xl mx-auto mb-8">
        <UserProfile />
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Col: Improvise Form */}
        <div>
          <h1 className="text-3xl font-bold">Improvise Lesson</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 mb-6">
            Review legal-approved content and improvise it for educational delivery. When ready, publish it to Citizens.
          </p>

          <form onSubmit={handleUpdateAndPublish} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <label className="block mb-2 font-medium">Lesson Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="e.g. History of the Preamble"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 font-medium">Module Name</label>
              <input
                type="text"
                required
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="e.g. Module 1: Introduction"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Content / Structure</label>
              <textarea
                required
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Write your educational content here..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={!editingLessonId}
              className={`w-full py-2 text-white rounded font-bold transition ${editingLessonId ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Update & Publish
            </button>
            {statusMessage && <p className="mt-4 text-center font-medium text-blue-600">{statusMessage}</p>}
          </form>
        </div>

        {/* Right Col: Existing Lessons */}
        <div>
          <div className="flex border-b mb-6">
            <button 
              className={`px-4 py-2 font-semibold ${activeTab === 'pending' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Lessons
            </button>
            <button 
              className={`px-4 py-2 font-semibold ${activeTab === 'published' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('published')}
            >
              Improvised List
            </button>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {activeTab === 'pending' && (
              <>
                {lessons.length === 0 ? (
                  <p className="text-gray-500">No lessons awaiting improvisation.</p>
                ) : (
                  lessons.map(lsn => (
                    <div key={lsn.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{lsn.title}</h3>
                        <button 
                          onClick={() => {
                            setEditingLessonId(lsn.id);
                            setTitle(lsn.title);
                            setModuleName(lsn.moduleName);
                            setContent(lsn.content);
                            setStatusMessage("");
                          }}
                          className="px-2 py-1 text-xs font-bold rounded bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Improvise
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-gray-500">{lsn.moduleName}</p>
                      <p className="text-sm mt-2 line-clamp-3 overflow-hidden text-ellipsis">{lsn.content}</p>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'published' && (
              <>
                {publishedLessons.length === 0 ? (
                  <p className="text-gray-500">No improvised lessons yet.</p>
                ) : (
                  publishedLessons.map(lsn => (
                    <div key={lsn.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded border border-green-300 dark:border-green-700">
                       <span className="inline-block mb-2 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                        PUBLISHED
                      </span>
                      <h3 className="font-bold text-lg">{lsn.title}</h3>
                      <p className="text-sm font-semibold text-gray-500">{lsn.moduleName}</p>
                      <p className="text-sm mt-2 line-clamp-3 overflow-hidden text-ellipsis">{lsn.content}</p>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default EducatorPanel;
